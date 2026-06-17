const mongoose = require('mongoose');

// This defines what a Product looks like
const productSchema = new mongoose.Schema({
  // Product name (e.g., ".com Domain")
  name: {
    type: String,
    required: true
  },
  
  // Product type: domain, hosting, email, ai_agent, website_dev, deployment
  type: {
    type: String,
    enum: ['domain', 'hosting', 'email', 'ai_agent', 'website_dev', 'deployment'],
    required: true
  },
  
  // Product description
  description: {
    type: String,
    default: ''
  },
  
  // Price in USD
  price: {
    type: Number,
    required: true
  },
  
  // List of features (e.g., ["Free SSL", "24/7 Support"])
  features: {
    type: [String],
    default: []
  },
  
  // Is this product available for purchase?
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Auto-adds createdAt and updatedAt
});

// Export the model
module.exports = mongoose.model('Product', productSchema);