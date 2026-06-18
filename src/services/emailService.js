const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) return null;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  return transporter;
}

function formatCurrency(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount);
}

function buildOrderItemsHtml(items) {
  return items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');
}

function emailWrapper(title, body) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
      <div style="background:linear-gradient(90deg,#2dd4bf,#a855f7);padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">${title}</h1>
      </div>
      <div style="padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">${body}
        <p style="color:#64748b;font-size:13px;margin-top:20px;">— The AzlanAI Team</p>
      </div>
    </div>`;
}

async function sendMail(to, subject, html) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('Email not configured — skipping:', subject);
    return false;
  }
  await mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to, subject, html
  });
  return true;
}

async function sendWelcomeEmail(user) {
  const html = emailWrapper('Welcome to AzlanAI! 🎉', `
    <p>Hi ${user.name},</p>
    <p>Welcome to <strong>AzlanAI</strong> — your all-in-one digital business platform.</p>
    <p>Explore domains, hosting, AI agents, and development services from your dashboard.</p>
    <p><a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/products.html" style="color:#a855f7;font-weight:600;">Browse Products →</a></p>
  `);
  return sendMail(user.email, 'Welcome to AzlanAI!', html);
}

async function sendOrderConfirmationEmail(order) {
  const itemsHtml = buildOrderItemsHtml(order.items);
  const html = emailWrapper('Order Confirmed ✓', `
    <p>Hi ${order.customerName},</p>
    <p>We've received your order and it's being processed.</p>
    <p><strong>Order ID:</strong> ${order._id}<br><strong>Status:</strong> ${order.status}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead><tr style="background:#f8fafc;">
        <th style="padding:8px 12px;text-align:left;">Product</th>
        <th style="padding:8px 12px;text-align:center;">Qty</th>
        <th style="padding:8px 12px;text-align:right;">Amount</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot><tr>
        <td colspan="2" style="padding:12px;text-align:right;font-weight:700;">Total</td>
        <td style="padding:12px;text-align:right;font-weight:700;color:#a855f7;">${formatCurrency(order.totalAmount, order.currency)}</td>
      </tr></tfoot>
    </table>
  `);
  return sendMail(order.customerEmail, `AzlanAI — Order Confirmation #${order._id.toString().slice(-8).toUpperCase()}`, html);
}

async function sendPaymentConfirmationEmail(order) {
  const itemsHtml = buildOrderItemsHtml(order.items);
  const html = emailWrapper('Payment Receipt ✓', `
    <p>Hi ${order.customerName},</p>
    <p>Your payment of <strong>${formatCurrency(order.totalAmount, order.currency)}</strong> has been received.</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead><tr style="background:#f8fafc;">
        <th style="padding:8px 12px;text-align:left;">Product</th>
        <th style="padding:8px 12px;text-align:center;">Qty</th>
        <th style="padding:8px 12px;text-align:right;">Amount</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p>View your orders in your <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/user-dashboard.html" style="color:#a855f7;">dashboard</a>.</p>
  `);
  return sendMail(order.customerEmail, `AzlanAI — Payment Receipt #${order._id.toString().slice(-8).toUpperCase()}`, html);
}

async function sendOrderStatusEmail(order) {
  const html = emailWrapper(`Order Update: ${order.status}`, `
    <p>Hi ${order.customerName},</p>
    <p>Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> status has been updated to <strong>${order.status}</strong>.</p>
    <p>Payment status: <strong>${order.paymentStatus}</strong></p>
  `);
  return sendMail(order.customerEmail, `AzlanAI — Order ${order.status}`, html);
}

async function sendPasswordResetEmail(user, resetUrl) {
  const html = emailWrapper('Reset Your Password', `
    <p>Hi ${user.name},</p>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <p><a href="${resetUrl}" style="display:inline-block;background:linear-gradient(90deg,#2dd4bf,#a855f7);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a></p>
    <p style="font-size:13px;color:#64748b;">If you didn't request this, ignore this email.</p>
  `);
  return sendMail(user.email, 'AzlanAI — Password Reset', html);
}

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordResetEmail
};
