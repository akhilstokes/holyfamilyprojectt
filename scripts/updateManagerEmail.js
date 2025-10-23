require('dotenv').config();
const mongoose = require('mongoose');
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

// Update manager email
const updateManagerEmail = async () => {
  try {
    // Find a manager (assuming there's at least one manager)
    const manager = await User.findOne({ role: 'manager' });
    
    if (!manager) {
      console.log('No manager found in the database.');
      return;
    }

    // Check if the email is already in use
    const emailExists = await User.findOne({ email: 'Manger@xyz.com' });
    if (emailExists && emailExists._id.toString() !== manager._id.toString()) {
      console.log('Email Manger@xyz.com is already in use by another account.');
      return;
    }

    // Update the manager's email
    const oldEmail = manager.email;
    manager.email = 'Manger@xyz.com';
    await manager.save();

    console.log('Manager email updated successfully:');
    console.log(`Old email: ${oldEmail}`);
    console.log(`New email: ${manager.email}`);
    
  } catch (error) {
    console.error('Error updating manager email:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
(async () => {
  await connectDB();
  await updateManagerEmail();
})();
