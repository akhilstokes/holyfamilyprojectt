const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const rateScheduler = require('./services/rateScheduler');

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

// Debug middleware to log requests (commented out for production)
// app.use((req, res, next) => {
//   if (req.path.includes('/user-management/')) {
//     console.log(`Request: ${req.method} ${req.path}`);
//   }
//   next();
// });

// Static hosting for uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Route Definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/barrels', require('./routes/barrelRoutes'));
app.use('/api/barrel-logistics', require('./routes/barrelMovementRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/capacity', require('./routes/capacityRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));
app.use('/api/rates', require('./routes/rateRoutes'));
app.use('/api/daily-rates', require('./routes/dailyRateRoutes'));
app.use('/api/user-rate-history', require('./routes/RateHistoryRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/latex', require('./routes/latexRoutes'));
// New admin endpoints for latex intake listing and pricing
app.use('/api/latex-intake', require('./routes/latexIntakeRoutes'));
app.use('/api/latex-pricing', require('./routes/latexPricingRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/user-management', require('./routes/userManagementRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/predict', require('./routes/predictionRoutes'));
app.use('/api/barrel-scrapes', require('./routes/barrelScrapeRoutes'));
app.use('/api/staff-barrels', require('./routes/staffBarrelRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/chemicals', require('./routes/chemRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/salary', require('./routes/salaryRoutes'));
app.use('/api/daily-wage', require('./routes/dailyWageRoutes'));
app.use('/api/monthly-wage', require('./routes/monthlyWageRoutes'));
app.use('/api/wage-templates', require('./routes/wageTemplateRoutes'));
app.use('/api/rate-scheduler', require('./routes/rateSchedulerRoutes'));

// Optional: Simple test route
app.get('/', (req, res) => {
    res.send('Holy Family Polymers API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start the rate scheduler after server starts
    setTimeout(() => {
        rateScheduler.start();
        console.log('Rate scheduler initialized');
    }, 2000); // Wait 2 seconds after server starts
});
