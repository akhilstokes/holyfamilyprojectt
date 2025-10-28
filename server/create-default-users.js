require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/holy-family-polymers';

async function createDefaultUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected...');

    // Define default users
    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@xyz.com',
        password: 'Admin@123',
        role: 'admin',
        phoneNumber: '1234567890'
      },
      {
        name: 'Manager User',
        email: 'manager@xyz.com',
        password: 'Manager@123',
        role: 'manager',
        phoneNumber: '1234567891'
      },
      {
        name: 'Accountant User',
        email: 'accountant@xyz.com',
        password: 'Accountant@123',
        role: 'accountant',
        phoneNumber: '1234567892'
      },
      {
        name: 'Delivery Staff',
        email: 'delivery@xyz.com',
        password: 'Delivery@123',
        role: 'delivery_staff',
        phoneNumber: '1234567893'
      },
      {
        name: 'Lab Staff',
        email: 'labstaff@xyz.com',
        password: 'Labstaff@123',
        role: 'lab_staff',
        phoneNumber: '1234567894'
      }
    ];

    // Create or update users
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        // Update existing user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        existingUser.password = hashedPassword;
        existingUser.role = userData.role;
        existingUser.name = userData.name;
        existingUser.phoneNumber = userData.phoneNumber;
        
        await existingUser.save({ validateBeforeSave: false });
        console.log(`✓ Updated ${userData.email} (${userData.role})`);
      } else {
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        
        await user.save({ validateBeforeSave: false });
        console.log(`✓ Created ${userData.email} (${userData.role})`);
      }
    }

    console.log('\n✅ Default users created/updated successfully!');
    
    // Display all users
    console.log('\n--- Default Login Credentials ---');
    console.log('Admin: admin@xyz.com / Admin@123');
    console.log('Manager: manager@xyz.com / Manager@123');
    console.log('Accountant: accountant@xyz.com / Accountant@123');
    console.log('Delivery Staff: delivery@xyz.com / Delivery@123');
    console.log('Lab Staff: labstaff@xyz.com / Labstaff@123');
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDefaultUsers();
