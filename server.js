console.log("🚀 Server starting...");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Don't use dotenv on Vercel - use environment variables directly
// require('dotenv').config();  <- REMOVE THIS LINE

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection - use process.env directly
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
    });
}

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚀 AI Digital Business API is LIVE!' });
});

// Import models - use absolute paths
const User = require('./src/models/User');
console.log('✅ User model loaded successfully');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Export for Vercel
module.exports = app;