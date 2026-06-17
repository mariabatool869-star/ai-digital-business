const mongoose = require('mongoose');

// Your Vercel connection string
const MONGODB_URI = 'mongodb+srv://admin:Maria987@cluster0.7tezhjc.mongodb.net/ai-business?retryWrites=true&w=majority';

const products = [
  {
    name: '.com Domain Registration',
    type: 'domain',
    description: 'Register your .com domain for 1 year',
    price: 12.99,
    features: ['1 year registration', 'DNS management', 'Domain forwarding'],
    isActive: true
  },
  {
    name: 'Basic Hosting Plan',
    type: 'hosting',
    description: 'Perfect for small websites and blogs',
    price: 5.99,
    features: ['10GB storage', '1 website', 'Free SSL', '24/7 support'],
    isActive: true
  },
  {
    name: 'Professional Hosting Plan',
    type: 'hosting',
    description: 'For growing businesses with more traffic',
    price: 15.99,
    features: ['50GB storage', '5 websites', 'Free SSL', 'Priority support'],
    isActive: true
  },
  {
    name: 'Business Email Hosting',
    type: 'email',
    description: 'Professional email for your domain',
    price: 4.99,
    features: ['1 email account', '5GB storage', 'Webmail access', 'Mobile sync'],
    isActive: true
  },
  {
    name: 'AI Sales Agent',
    type: 'ai_agent',
    description: 'AI assistant that helps sell your products',
    price: 29.99,
    features: ['24/7 availability', 'Product recommendations', 'Lead generation'],
    isActive: true
  },
  {
    name: 'AI Support Agent',
    type: 'ai_agent',
    description: 'AI assistant that handles customer support',
    price: 29.99,
    features: ['FAQ answers', 'Ticket creation', 'Multi-language support'],
    isActive: true
  },
  {
    name: 'Website Development Service',
    type: 'website_dev',
    description: 'Professional website built with AI assistance',
    price: 299.99,
    features: ['Custom design', 'Mobile responsive', 'SEO optimized'],
    isActive: true
  },
  {
    name: 'Website Deployment Service',
    type: 'deployment',
    description: 'Deploy your website to our hosting platform',
    price: 49.99,
    features: ['1-click deployment', 'SSL certificate', 'Domain connection'],
    isActive: true
  }
];

async function seedVercel() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({
      name: String,
      type: String,
      description: String,
      price: Number,
      features: [String],
      isActive: Boolean
    }));

    await Product.deleteMany({});
    console.log('🗑️ Existing products removed');

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products added to database`);

    console.log('🎉 Seeding complete!');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedVercel();