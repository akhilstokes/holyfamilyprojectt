const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://akhilnk2026:akhilnk2026@cluster0.yxbzoog.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
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
    // Find a manager (or create one if none exists)
    let manager = await User.findOne({ role: 'manager' });
    
    if (!manager) {
      console.log('No manager found. Creating a new manager account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Manger@123', salt);
      
      manager = new User({
        name: 'Manager',
        email: 'Manger@xyz.com',
        password: hashedPassword,
        role: 'manager',
        phoneNumber: '+919876543210',
        isActive: true
      });
    } else {
      // Update existing manager
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Manger@123', salt);
      
      manager.email = 'Manger@xyz.com';
      manager.password = hashedPassword;
      manager.isActive = true;
    }

    await manager.save();
    console.log('\n=== Manager Credentials Updated Successfully ===');
    console.log('Email: Manger@xyz.com');
    console.log('Password: Manger@123');
    console.log('============================================\n');
    
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
