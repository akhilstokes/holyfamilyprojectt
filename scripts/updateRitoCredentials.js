require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../server/models/userModel');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

// Update or create rito@xyz.com account
const updateRitoCredentials = async () => {
  try {
    // First, try to find existing account with old email
    let user = await User.findOne({ email: 'akhilnk856@gmail.com' });
    
    if (user) {
      console.log('Found existing user with email: akhilnk856@gmail.com');
      console.log('Updating to new credentials...');
      
      // Update email and password
      user.email = 'rito@xyz.com';
      user.password = 'Akhil@68'; // Will be hashed by pre-save hook
      await user.save();
      
      console.log('✅ User credentials updated successfully!');
      console.log(`Email: ${user.email}`);
      console.log('Password: Akhil@68');
      console.log(`Role: ${user.role}`);
    } else {
      // Check if rito@xyz.com already exists
      user = await User.findOne({ email: 'rito@xyz.com' });
      
      if (user) {
        console.log('User rito@xyz.com already exists. Updating password...');
        user.password = 'Akhil@68'; // Will be hashed by pre-save hook
        await user.save();
        
        console.log('✅ Password updated successfully!');
        console.log(`Email: ${user.email}`);
        console.log('Password: Akhil@68');
        console.log(`Role: ${user.role}`);
      } else {
        // Create new user
        console.log('Creating new user: rito@xyz.com');
        
        const newUser = await User.create({
          name: 'Rito',
          email: 'rito@xyz.com',
          password: 'Akhil@68',
          phoneNumber: '9876543210',
          role: 'manager', // Change to 'admin', 'manager', 'staff', or 'user' as needed
          status: 'active'
        });
        
        console.log('✅ New user created successfully!');
        console.log(`Email: ${newUser.email}`);
        console.log('Password: Akhil@68');
        console.log(`Role: ${newUser.role}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating credentials:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
(async () => {
  await connectDB();
  await updateRitoCredentials();
})();
