// Debug script to test server components
const mongoose = require('mongoose');
require('dotenv').config();

async function testServer() {
    try {
        console.log('Testing server components...');
        
        // Test database connection
        console.log('1. Testing database connection...');
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/holy-family-polymers');
        console.log('✅ Database connected:', conn.connection.host);
        
        // Test model import
        console.log('2. Testing model imports...');
        const LatexRequest = require('./models/latexRequestModel');
        const User = require('./models/userModel');
        console.log('✅ Models imported successfully');
        
        // Test model creation
        console.log('3. Testing model creation...');
        const testRequest = new LatexRequest({
            user: new mongoose.Types.ObjectId(),
            quantity: 100,
            quality: 'standard',
            location: 'Test Location',
            contactNumber: '1234567890',
            currentRate: 150,
            estimatedPayment: 15000,
            status: 'pending'
        });
        console.log('✅ Model creation successful');
        
        // Test query
        console.log('4. Testing database query...');
        const count = await LatexRequest.countDocuments();
        console.log('✅ Database query successful, count:', count);
        
        console.log('🎉 All tests passed! Server should be working.');
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testServer();




















