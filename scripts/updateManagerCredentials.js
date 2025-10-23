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

// Update manager credentials
const updateManagerCredentials = async () => {
  try {
    // Check if manager exists
    const manager = await User.findOne({ email: 'manger@xyz.com' });
    
    if (!manager) {
      console.log('Manager with email manger@xyz.com not found.');
      console.log('Available manager emails:');
      const managers = await User.find({ role: 'manager' }, 'email');
      managers.forEach(m => console.log(`- ${m.email}`));
      return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Manger@123', salt);

    // Update the manager's password
    manager.password = hashedPassword;
    await manager.save();

    console.log('Manager credentials updated successfully:');
    console.log(`Email: ${manager.email}`);
    console.log('New password: Manger@123');
    
  } catch (error) {
    console.error('Error updating manager credentials:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
(async () => {
  await connectDB();
  await updateManagerCredentials();
})();
