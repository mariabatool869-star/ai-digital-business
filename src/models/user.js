const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// This defines what a User looks like in the database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true  // User MUST have a name
  },
  email: {
    type: String,
    required: true,  // User MUST have an email
    unique: true     // No two users can have same email
  },
  password: {
    type: String,
    required: true   // User MUST have a password
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],  // Only these two roles allowed
    default: 'customer'           // New users are customers by default
  },
  createdAt: {
    type: Date,
    default: Date.now  // Automatically sets the date
  }
});

// This runs BEFORE saving a user to the database
// It encrypts (hashes) the password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  // If password isn't changed, skip
  this.password = await bcrypt.hash(this.password, 10);  // Encrypt password
  next();
});

// This is a function that checks if a password is correct
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the model so other files can use it
module.exports = mongoose.model('User', userSchema);