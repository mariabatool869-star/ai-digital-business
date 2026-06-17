// 1. IMPORT THE USER MODEL (so we can work with users)
const User = require('../models/User');

// 2. IMPORT JWT (for creating security tokens)
const jwt = require('jsonwebtoken');

// 3. HELPER FUNCTION: Generate a token (digital key)
const generateToken = (id) => {
  // This creates a token that expires in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// 4. REGISTER FUNCTION (create new user)
exports.register = async (req, res) => {
  try {
    // Get name, email, password from the request body
    const { name, email, password } = req.body;

    // Check if user already exists in database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create the new user
    const user = await User.create({
      name,
      email,
      password  // This will be encrypted automatically (from User.js)
    });

    // Send back the user info + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)  // Give them a digital key
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. LOGIN FUNCTION (log in existing user)
exports.login = async (req, res) => {
  try {
    // Get email and password from the request
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    
    // If user doesn't exist
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches (using the comparePassword function from User.js)
    const isPasswordMatch = await user.comparePassword(password);
    
    // If password is wrong
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If everything is correct, send back user info + token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)  // Give them a digital key
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};