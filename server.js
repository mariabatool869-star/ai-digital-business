console.log("🚀 Server starting...");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚀 AI Digital Business API is LIVE!' });
});

// Import routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Error handling middleware (simple)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Something went wrong' });
});

// Export for Vercel
module.exports = app;