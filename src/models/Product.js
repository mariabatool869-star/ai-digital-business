const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['domain', 'hosting', 'email', 'ai_agent', 'website_dev', 'deployment'],
    required: true
  },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  features: { type: [String], default: [] },
  image: { type: String, default: '' },
  stock: { type: Number, default: 100, min: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
