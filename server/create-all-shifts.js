const mongoose = require('mongoose');
const Shift = require('./models/shiftModel');
const User = require('./models/userModel');
require('dotenv').config();

const createAllShifts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/holy-family-polymers');
    console.log('✅ Connected to MongoDB');

    // Find a user to set as creator
    const adminUser = await User.findOne({ role: 'admin' }) || 
                      await User.findOne({ role: 'manager' }) || 
                      await User.findOne();
    
    if (!adminUser) {
      throw new Error('No users found in database');
    }
    console.log(`📝 Using user "${adminUser.name || adminUser.email}" as creator\n`);

    // Define all shifts
    const shiftsToCreate = [
      {
        name: 'Field Staff Morning',
        startTime: '06:00',
        endTime: '12:00',
        gracePeriod: 15,
        description: 'Field staff morning shift: 6:00 AM - 12:00 PM'
      },
      {
        name: 'Field Staff Afternoon',
        startTime: '12:00',
        endTime: '18:00',
        gracePeriod: 15,
        description: 'Field staff afternoon shift: 12:00 PM - 6:00 PM'
      },
      {
        name: 'Accountant Office Hours',
        startTime: '08:00',
        endTime: '17:00',
        gracePeriod: 10,
        description: 'Accountant shift: 8:00 AM - 5:00 PM (Check-in: 8:00-8:10 AM, Check-out: 4:55-5:05 PM)'
      },
      {
        name: 'Delivery Staff Hours',
        startTime: '08:00',
        endTime: '17:00',
        gracePeriod: 15,
        description: 'Delivery staff shift: 8:00 AM - 5:00 PM'
      }
    ];

    console.log('🔄 Creating/Updating shifts...\n');

    for (const shiftData of shiftsToCreate) {
      // Check if shift exists
      const existingShift = await Shift.findOne({ name: shiftData.name });
      
      if (existingShift) {
        // Update existing shift
        existingShift.startTime = shiftData.startTime;
        existingShift.endTime = shiftData.endTime;
        existingShift.gracePeriod = shiftData.gracePeriod;
        existingShift.description = shiftData.description;
        existingShift.isActive = true;
        await existingShift.save();
        
        console.log(`✅ Updated: ${shiftData.name}`);
        console.log(`   Time: ${shiftData.startTime} - ${shiftData.endTime}`);
        console.log(`   Grace: ${shiftData.gracePeriod} minutes\n`);
      } else {
        // Create new shift
        const newShift = await Shift.create({
          name: shiftData.name,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          gracePeriod: shiftData.gracePeriod,
          description: shiftData.description,
          isActive: true,
          createdBy: adminUser._id,
          assignedStaff: []
        });
        
        console.log(`✅ Created: ${shiftData.name}`);
        console.log(`   Shift ID: ${newShift._id}`);
        console.log(`   Time: ${shiftData.startTime} - ${shiftData.endTime}`);
        console.log(`   Grace: ${shiftData.gracePeriod} minutes\n`);
      }
    }

    // Display summary
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 SHIFT SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');

    const allShifts = await Shift.find({ isActive: true }).sort({ startTime: 1 });
    
    allShifts.forEach(shift => {
      console.log(`👥 ${shift.name}`);
      console.log(`   ⏰ ${shift.startTime} - ${shift.endTime}`);
      console.log(`   ⏱️  Grace: ${shift.gracePeriod} minutes`);
      console.log(`   📋 ${shift.description}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL SHIFTS CONFIGURED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════');

    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createAllShifts();

