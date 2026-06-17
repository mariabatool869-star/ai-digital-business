console.log("🚀 Server starting...");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ FIXED - No comma after MONGODB_URI
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('📝 Please check your MONGODB_URI in .env file');
  });

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚀 AI Digital Business API is running!' });
});

// Import models and routes
const User = require('./src/models/User');
console.log('✅ User model loaded successfully');

const authcontroller = require('./src/controllers/authcontroller');
console.log('✅ Auth controller loaded successfully');

const authRoutes = require('./src/routes/authRoutes');

// Use the auth routes for /api/auth URLs
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});