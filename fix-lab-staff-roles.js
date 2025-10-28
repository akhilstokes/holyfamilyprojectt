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

// Fix lab staff roles
const fixLabStaffRoles = async () => {
  try {
    await connectDB();

    console.log('🔍 Checking existing users with role "lab"...');
    
    // Find all users with role "lab"
    const labUsers = await User.find({ role: 'lab' });
    console.log(`Found ${labUsers.length} users with role "lab"`);

    // Update them to "lab_staff"
    for (const user of labUsers) {
      console.log(`Updating user: ${user.name} (${user.email}) from "lab" to "lab_staff"`);
      await User.findByIdAndUpdate(user._id, { 
        role: 'lab_staff',
        updatedAt: new Date()
      });
    }

    console.log('✅ Updated existing lab users to lab_staff role');

    // Check if we have any lab_staff users now
    const labStaffUsers = await User.find({ role: 'lab_staff', status: 'active' });
    console.log(`\n📊 Current lab_staff users (${labStaffUsers.length}):`);
    
    labStaffUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Status: ${user.status}`);
    });

    // If no lab_staff users, create some
    if (labStaffUsers.length === 0) {
      console.log('\n⚠️ No lab_staff users found. Creating default lab staff...');
      
      const defaultLabStaff = {
        name: 'Default Lab Staff',
        email: 'labstaff@holyfamily.com',
        phoneNumber: '9876543210',
        role: 'lab_staff',
        staffId: 'LAB001',
        status: 'active'
      };

      // Check if user already exists
      const existing = await User.findOne({ email: defaultLabStaff.email });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('LabStaff@123', salt);
        
        await User.create({
          ...defaultLabStaff,
          password: hashedPassword
        });
        console.log('✅ Created default lab staff user');
      } else {
        // Update existing user to lab_staff
        await User.findByIdAndUpdate(existing._id, { 
          role: 'lab_staff',
          status: 'active',
          updatedAt: new Date()
        });
        console.log('✅ Updated existing user to lab_staff role');
      }
    }

    // Final check
    const finalLabStaffUsers = await User.find({ role: 'lab_staff', status: 'active' });
    console.log(`\n🎉 Final lab_staff users count: ${finalLabStaffUsers.length}`);
    
    if (finalLabStaffUsers.length > 0) {
      console.log('\nLab staff users available:');
      finalLabStaffUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Staff ID: ${user.staffId || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('Error fixing lab staff roles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
fixLabStaffRoles();
