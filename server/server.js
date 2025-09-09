const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to the MongoDB database
connectDB();

const app = express();

// ✅ CORS Setup: Allow React frontend (localhost:3000) to access backend (localhost:5000)
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Enable JSON parsing for incoming requests
app.use(express.json());

// ✅ Route Definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/barrels', require('./routes/barrelRoutes'));
app.use('/api/barrel-logistics', require('./routes/barrelMovementRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));
app.use('/api/rates', require('./routes/rateRoutes'));
app.use('/api/user-rate-history', require('./routes/RateHistoryRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/latex', require('./routes/latexRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/user-management', require('./routes/userManagementRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/predict', require('./routes/predictionRoutes'));

// Optional: Simple test route
app.get('/', (req, res) => {
    res.send('Holy Family Polymers API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
