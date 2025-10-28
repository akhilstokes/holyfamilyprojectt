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

// Test the same query that the API uses
const testLabStaffQuery = async () => {
  try {
    await connectDB();

    console.log('🔍 Testing lab_staff query (same as API)...');
    
    // This is the exact query from wagesController.js
    const query = {
      role: 'lab_staff',
      status: { $ne: 'deleted' }
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const staff = await User.find(query)
      .select('_id name email role staffId status')
      .sort({ name: 1 });
    
    console.log(`\n📊 Found ${staff.length} lab_staff users:`);
    
    if (staff.length > 0) {
      staff.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.status} - Staff ID: ${user.staffId || 'N/A'}`);
      });
    } else {
      console.log('❌ No lab_staff users found!');
      
      // Check what roles actually exist
      console.log('\n🔍 Checking all roles in database...');
      const allUsers = await User.find({}).select('name email role status');
      const roleCounts = {};
      allUsers.forEach(user => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });
      
      console.log('Role distribution:');
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`  ${role}: ${count} users`);
      });
    }

  } catch (error) {
    console.error('Error testing lab staff query:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the test
testLabStaffQuery();
