const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Check and create lab staff
const checkAndCreateLabStaff = async () => {
  try {
    await connectDB();

    console.log('🔍 Checking all users in database...');
    
    // Get all users
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    
    console.log('\nAll users:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.status}`);
    });

    // Check for lab_staff users
    const labStaffUsers = await User.find({ role: 'lab_staff', status: 'active' });
    console.log(`\n📊 Active lab_staff users: ${labStaffUsers.length}`);
    
    if (labStaffUsers.length === 0) {
      console.log('\n⚠️ No active lab_staff users found. Creating one...');
      
      // Create a lab staff user
      const labStaffUser = {
        name: 'Akhil N. K',
        email: 'akhilnk239@gmail.com',
        phoneNumber: '9876543210',
        role: 'lab_staff',
        staffId: 'LAB001',
        status: 'active'
      };

      // Check if user already exists
      const existing = await User.findOne({ email: labStaffUser.email });
      if (existing) {
        console.log('User already exists, updating role...');
        await User.findByIdAndUpdate(existing._id, { 
          role: 'lab_staff',
          status: 'active',
          updatedAt: new Date()
        });
        console.log('✅ Updated existing user to lab_staff role');
      } else {
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('LabStaff@123', salt);
        
        await User.create({
          ...labStaffUser,
          password: hashedPassword
        });
        console.log('✅ Created new lab_staff user');
      }
    }

    // Final check
    const finalLabStaffUsers = await User.find({ role: 'lab_staff', status: 'active' });
    console.log(`\n🎉 Final lab_staff users count: ${finalLabStaffUsers.length}`);
    
    if (finalLabStaffUsers.length > 0) {
      console.log('\nLab staff users available for wages calculation:');
      finalLabStaffUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Staff ID: ${user.staffId || 'N/A'}`);
      });
    } else {
      console.log('❌ Still no lab_staff users found. There may be a database connection issue.');
    }

  } catch (error) {
    console.error('Error checking and creating lab staff:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
checkAndCreateLabStaff();
