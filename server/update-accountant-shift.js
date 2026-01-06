const mongoose = require('mongoose');
const Shift = require('./models/shiftModel');
require('dotenv').config();

const updateAccountantShift = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/holy-family-polymers');
    console.log('✅ Connected to MongoDB');

    // Update the Accountant shift
    const result = await Shift.updateOne(
      { name: 'Accountant Office Hours' },
      { 
        $set: { 
          startTime: '08:00',
          endTime: '17:00',
          gracePeriod: 10,  // 10 minutes grace period
          isActive: true
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('⚠️  Accountant shift not found. Creating new one...');
      
      // Find any user to set as creator
      const User = require('./models/userModel');
      const anyUser = await User.findOne();
      
      if (!anyUser) {
        throw new Error('No users found in database');
      }

      // Create new shift
      await Shift.create({
        name: 'Accountant Office Hours',
        startTime: '08:00',
        endTime: '17:00',
        gracePeriod: 10,
        description: 'Accountant shift: 8:00 AM - 5:00 PM (Check-in: 8:00-8:10 AM, Check-out: 4:55-5:05 PM)',
        isActive: true,
        createdBy: anyUser._id,
        assignedStaff: []
      });
      
      console.log('✅ Created new Accountant shift');
    } else {
      console.log('✅ Updated Accountant shift successfully!');
    }

    // Display current shift details
    const shift = await Shift.findOne({ name: 'Accountant Office Hours' });
    if (shift) {
      console.log('\n📋 Current Accountant Shift Details:');
      console.log(`   Shift ID: ${shift._id}`);
      console.log(`   Name: ${shift.name}`);
      console.log(`   Start Time: ${shift.startTime} (8:00 AM)`);
      console.log(`   End Time: ${shift.endTime} (5:00 PM)`);
      console.log(`   Grace Period: ${shift.gracePeriod} minutes`);
      console.log(`   Status: ${shift.isActive ? 'Active ✅' : 'Inactive ❌'}`);
      console.log('');
      console.log('✅ Shift timings now match attendance windows:');
      console.log('   📌 Check-in: 8:00-8:10 AM');
      console.log('   📌 Check-out: 4:55-5:05 PM');
    }

    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error updating shift:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
updateAccountantShift();

