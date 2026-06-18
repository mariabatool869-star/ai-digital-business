require('dotenv').config();
console.log("🚀 Server starting...");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ FIXED CORS for HTTPS
app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Stripe webhook needs raw body — must be registered before express.json()
const { stripeWebhook } = require('./src/controllers/paymentController');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// API Routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const userRoutes = require('./src/routes/userRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const domainRoutes = require('./src/routes/domainRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/chat', chatRoutes);

// Local development server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

// ✅ FIXED: For Vercel, export the app
module.exports = app;