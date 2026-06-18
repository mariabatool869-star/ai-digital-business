const Stripe = require('stripe');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendPaymentConfirmationEmail, sendOrderConfirmationEmail } = require('../services/emailService');

let stripeClient = null;

function getStripe() {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

function getBaseUrl(req) {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL.replace(/\/$/, '');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
}

async function fulfillOrder(orderId, stripeSession) {
  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === 'paid') return order;

  order.paymentStatus = 'paid';
  order.status = 'processing';
  order.stripePaymentIntentId = stripeSession.payment_intent || order.stripePaymentIntentId;
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
  }

  try {
    await sendPaymentConfirmationEmail(order);
  } catch (err) {
    console.error('Payment confirmation email failed:', err.message);
  }

  return order;
}

exports.createCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe is not configured on the server' });
    }

    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const lineItems = [];
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product not available: ${item.productId}` });
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      totalAmount += product.price * quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        type: product.type,
        price: product.price,
        quantity
      });

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description || `${product.type} service from AzlanAI`
          },
          unit_amount: Math.round(product.price * 100)
        },
        quantity
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      customerEmail: req.user.email,
      customerName: req.user.name,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const baseUrl = getBaseUrl(req);

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: lineItems,
      success_url: `${baseUrl}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout.html?cancelled=true`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    order.stripeSessionId = session.id;
    await order.save();

    try { await sendOrderConfirmationEmail(order); } catch (e) { console.error('Order email failed:', e.message); }

    res.json({ url: session.url, sessionId: session.id, orderId: order._id });
  } catch (error) {
    console.error('Checkout session error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.verifySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const order = await Order.findById(session.metadata.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    if (session.payment_status === 'paid' && order.paymentStatus !== 'paid') {
      await fulfillOrder(order._id, session);
    }

    const updatedOrder = await Order.findById(order._id);
    res.json({
      paymentStatus: updatedOrder.paymentStatus,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.metadata?.orderId) {
        await fulfillOrder(session.metadata.orderId, session);
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    return res.status(500).send('Webhook handler failed');
  }

  res.json({ received: true });
};
