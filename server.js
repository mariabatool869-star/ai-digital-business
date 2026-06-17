require('dotenv').config();
console.log("🚀 Server starting...");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚀 AI Digital Business API is LIVE!' });
});

// Import routes - ONLY ONCE!
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Import models (for verification)
const Product = require('./src/models/Product');
console.log('✅ Product model loaded');

console.log('MONGODB_URI:', process.env.MONGODB_URI);

module.exports = app;