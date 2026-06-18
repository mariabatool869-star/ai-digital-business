require('dotenv').config();
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

const IMG = {
  domain: 'https://placehold.co/400x200/2563eb/ffffff?text=Domain',
  hosting: 'https://placehold.co/400x200/7c3aed/ffffff?text=Hosting',
  email: 'https://placehold.co/400x200/0891b2/ffffff?text=Email',
  ai_agent: 'https://placehold.co/400x200/a855f7/ffffff?text=AI+Agent',
  website_dev: 'https://placehold.co/400x200/f97316/ffffff?text=Web+Dev',
  deployment: 'https://placehold.co/400x200/22c55e/ffffff?text=Deploy'
};

const products = [
  { name: '.com Domain Registration', type: 'domain', description: 'Register your .com domain for 1 year', price: 12.99, features: ['1 year registration', 'DNS management', 'Domain forwarding'], image: IMG.domain, stock: 999, isActive: true },
  { name: 'Basic Hosting Plan', type: 'hosting', description: 'Perfect for small websites and blogs', price: 5.99, features: ['10GB storage', '1 website', 'Free SSL', '24/7 support'], image: IMG.hosting, stock: 50, isActive: true },
  { name: 'Professional Hosting Plan', type: 'hosting', description: 'For growing businesses with more traffic', price: 15.99, features: ['50GB storage', '5 websites', 'Free SSL', 'Priority support'], image: IMG.hosting, stock: 30, isActive: true },
  { name: 'Business Email Hosting', type: 'email', description: 'Professional email for your domain', price: 4.99, features: ['1 email account', '5GB storage', 'Webmail access', 'Mobile sync'], image: IMG.email, stock: 100, isActive: true },
  { name: 'AI Sales Agent', type: 'ai_agent', description: 'AI assistant that helps sell your products', price: 29.99, features: ['24/7 availability', 'Product recommendations', 'Lead generation'], image: IMG.ai_agent, stock: 25, isActive: true },
  { name: 'AI Support Agent', type: 'ai_agent', description: 'AI assistant that handles customer support', price: 29.99, features: ['FAQ answers', 'Ticket creation', 'Multi-language support'], image: IMG.ai_agent, stock: 25, isActive: true },
  { name: 'Website Development Service', type: 'website_dev', description: 'Professional website built with AI assistance', price: 299.99, features: ['Custom design', 'Mobile responsive', 'SEO optimized'], image: IMG.website_dev, stock: 10, isActive: true },
  { name: 'Website Deployment Service', type: 'deployment', description: 'Deploy your website to our hosting platform', price: 49.99, features: ['1-click deployment', 'SSL certificate', 'Domain connection'], image: IMG.deployment, stock: 40, isActive: true }
];

async function seedVercel() {
  try {
    await mongoose.connect(MONGODB_URI);
    const Product = require('./src/models/Product');
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded with images & stock`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedVercel();
