const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/holy-family-polymers', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, default: '0000000000' },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'manager', 'accountant', 'field_staff', 'delivery_staff', 'lab', 'lab_manager', 'lab_staff'],
    default: 'user' 
  },
  staffId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Update specific user's role
const updateUserRole = async () => {
  try {
    await connectDB();

    console.log('🔍 Looking for user with email: akhilnk239@gmail.com');
    
    // Find the specific user
    const user = await User.findOne({ email: 'akhilnk239@gmail.com' });
    
    if (user) {
      console.log(`Found user: ${user.name} (${user.email})`);
      console.log(`Current role: ${user.role}`);
      console.log(`Current status: ${user.status}`);
      
      // Update role to lab_staff
      await User.findByIdAndUpdate(user._id, { 
        role: 'lab_staff',
        updatedAt: new Date()
      });
      
      console.log('✅ Updated user role from "lab" to "lab_staff"');
      
      // Verify the update
      const updatedUser = await User.findById(user._id);
      console.log(`Updated role: ${updatedUser.role}`);
      
    } else {
      console.log('❌ User not found with email: akhilnk239@gmail.com');
    }

    // Check all lab_staff users
    const labStaffUsers = await User.find({ role: 'lab_staff', status: 'active' });
    console.log(`\n📊 Total active lab_staff users: ${labStaffUsers.length}`);
    
    labStaffUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Staff ID: ${user.staffId || 'N/A'}`);
    });

  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
updateUserRole();
