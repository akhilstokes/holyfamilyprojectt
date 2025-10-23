const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://akhilnk2026:akhilnk2026@cluster0.yxbzoog.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
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
const updateManagerAccount = async () => {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Manager@123', salt);

    // Update or create manager
    const manager = await User.findOneAndUpdate(
      { email: /manger@xyz\.com/i }, // Case-insensitive search for common typo
      {
        name: 'Manager',
        email: 'manager@xyz.com', // Corrected email
        password: hashedPassword,
        role: 'manager',
        phoneNumber: '+919876543210',
        isActive: true
      },
      { 
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true 
      }
    );

    console.log('✅ Manager account updated successfully!');
    console.log('Email:', manager.email);
    console.log('Password: Manager@123');
    console.log('Role:', manager.role);
    
  } catch (error) {
    console.error('❌ Error updating manager account:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
(async () => {
  await connectDB();
  await updateManagerAccount();
})();
