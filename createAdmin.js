require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    await User.deleteMany({ email: 'admin@azlanai.com' });
    console.log('🗑️ Old admin removed');

    // Create new admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@azlanai.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@azlanai.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role:', admin.role);

    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();