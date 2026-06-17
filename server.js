console.log("🚀 Server starting...");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Check if MONGODB_URI exists
const MONGODB_URI = process.env.MONGODB_URI;
console.log('🔍 MONGODB_URI exists:', !!MONGODB_URI);
console.log('🔍 MONGODB_URI length:', MONGODB_URI ? MONGODB_URI.length : 0);

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is NOT set in environment variables!');
} else {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
  });
}

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 AI Digital Business API is LIVE!',
    mongodb_uri_set: !!process.env.MONGODB_URI
  });
});

// Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

module.exports = app;