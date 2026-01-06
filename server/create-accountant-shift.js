const mongoose = require('mongoose');
const Shift = require('./models/shiftModel');
const User = require('./models/userModel');
require('dotenv').config();

const createAccountantShift = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/holy-family-polymers');
    console.log('✅ Connected to MongoDB');

    // Find an admin or manager user to set as creator
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'manager' });
    }
    if (!adminUser) {
      // Use any user as fallback
      adminUser = await User.findOne();
    }
    if (!adminUser) {
      throw new Error('No users found in database. Please create a user first.');
    }
    console.log(`📝 Using user "${adminUser.name || adminUser.email}" as creator`);

    // Check if shift already exists
    const existingShift = await Shift.findOne({ name: 'Accountant Office Hours' });
    if (existingShift) {
      console.log('⚠️  Accountant shift already exists!');
      console.log('📋 Existing Shift Details:');
      console.log(`   Name: ${existingShift.name}`);
      console.log(`   Start Time: ${existingShift.startTime}`);
      console.log(`   End Time: ${existingShift.endTime}`);
      console.log(`   Grace Period: ${existingShift.gracePeriod} minutes`);
      
      // Update if needed
      existingShift.startTime = '08:00';
      existingShift.endTime = '17:00';
      existingShift.gracePeriod = 15;
      existingShift.isActive = true;
      await existingShift.save();
      console.log('✅ Updated shift timings to 8:00 AM - 5:00 PM');
      
      mongoose.connection.close();
      return;
    }

    // Create new shift
    const newShift = await Shift.create({
      name: 'Accountant Office Hours',
      startTime: '08:00', // 8:00 AM
      endTime: '17:00',   // 5:00 PM (17:00)
      gracePeriod: 15,    // 15 minutes grace period
      description: 'Regular office hours for accountant staff - 8 AM to 5 PM',
      isActive: true,
      createdBy: adminUser._id,
      assignedStaff: [] // Will be assigned later
    });

    console.log('✅ Accountant shift created successfully!');
    console.log('📋 Shift Details:');
    console.log(`   Shift ID: ${newShift._id}`);
    console.log(`   Name: ${newShift.name}`);
    console.log(`   Start Time: ${newShift.startTime} (8:00 AM)`);
    console.log(`   End Time: ${newShift.endTime} (5:00 PM)`);
    console.log(`   Duration: 9 hours`);
    console.log(`   Grace Period: ${newShift.gracePeriod} minutes`);
    console.log(`   Status: ${newShift.isActive ? 'Active' : 'Inactive'}`);
    console.log('');
    console.log('🎉 Now you can assign accountants to this shift from the Manager Dashboard!');

    // Close connection
    mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating shift:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createAccountantShift();

