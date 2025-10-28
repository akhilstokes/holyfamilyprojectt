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

// User Schema (simplified)
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

// Add lab staff users
const addLabStaffUsers = async () => {
  try {
    await connectDB();

    const labStaffUsers = [
      {
        name: 'Lab Staff 1',
        email: 'labstaff1@holyfamily.com',
        phoneNumber: '9876543210',
        role: 'lab_staff',
        staffId: 'LAB001'
      },
      {
        name: 'Lab Staff 2', 
        email: 'labstaff2@holyfamily.com',
        phoneNumber: '9876543211',
        role: 'lab_staff',
        staffId: 'LAB002'
      },
      {
        name: 'Lab Manager',
        email: 'labmanager@holyfamily.com',
        phoneNumber: '9876543212',
        role: 'lab_manager',
        staffId: 'LABMGR'
      }
    ];

    for (const userData of labStaffUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password (using staffId as default password)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.staffId, salt);

      // Create user
      const newUser = new User({
        ...userData,
        password: hashedPassword,
        status: 'active'
      });

      await newUser.save();
      console.log(`✅ Created ${userData.role}: ${userData.name} (${userData.email})`);
      console.log(`   Staff ID: ${userData.staffId}`);
      console.log(`   Default Password: ${userData.staffId}`);
      console.log('');
    }

    console.log('🎉 Lab staff users created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Lab Staff 1: labstaff1@holyfamily.com / LAB001');
    console.log('Lab Staff 2: labstaff2@holyfamily.com / LAB002');
    console.log('Lab Manager: labmanager@holyfamily.com / LABMGR');

  } catch (error) {
    console.error('Error adding lab staff users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
addLabStaffUsers();
