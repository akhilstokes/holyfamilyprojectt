const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const staffInviteController = require('./controllers/staffInviteController');
const rateScheduler = require('./services/rateScheduler');

// Load environment variables
dotenv.config();

// Connect to the MongoDB database (server will start after successful connection)
// We'll await this in an init function below

const app = express();

// ✅ CORS Setup: Allow React frontend, Vercel, and Render deployments
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'https://holyfamilyprojectt.vercel.app',
    'https://holyfamilyprojectt-b486fa3gw-akhilstokes-projects.vercel.app',
    'https://holy-family-polymers-frontend.onrender.com',
    process.env.FRONTEND_URL // Dynamic frontend URL from env
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Add Cross-Origin-Opener-Policy header to allow Google OAuth popups
app.use((req, res, next) => {
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

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
// Public staff verify endpoint must be reachable without auth
app.post('/api/staff/verify-invite', staffInviteController.verify);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/barrels', require('./routes/barrelRoutes'));
app.use('/api/barrel-logistics', require('./routes/barrelMovementRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/capacity', require('./routes/capacityRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));
app.use('/api/rates', require('./routes/rateRoutes'));
app.use('/api/daily-rates', require('./routes/dailyRateRoutes'));
app.use('/api/user-rate-history', require('./routes/RateHistoryRoutes'));
app.use('/api/latex', require('./routes/latexRoutes'));

// Enhanced routes with role-based access control
app.use('/api', require('./routes/enhancedRoutes'));

// Barrel tracking and DRC workflow routes
app.use('/api', require('./routes/barrelTrackingRoutes'));
// New admin endpoints for latex intake listing and pricing
app.use('/api/latex-intake', require('./routes/latexIntakeRoutes'));
app.use('/api/latex-pricing', require('./routes/latexPricingRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/user-management', require('./routes/userManagementRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/predict', require('./routes/predictionRoutes'));
app.use('/api/barrel-scrapes', require('./routes/barrelScrapeRoutes'));
app.use('/api/damages', require('./routes/damageRoutes'));
app.use('/api/repairs', require('./routes/repairRoutes'));
app.use('/api/staff-barrels', require('./routes/staffBarrelRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/chemicals', require('./routes/chemRoutes'));
app.use('/api/chem-requests', require('./routes/chemicalRequestRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/salary', require('./routes/salaryRoutes'));
app.use('/api/wages', require('./routes/wagesRoutes'));
app.use('/api/daily-wage', require('./routes/dailyWageRoutes'));
app.use('/api/monthly-wage', require('./routes/monthlyWageRoutes'));
app.use('/api/wage-templates', require('./routes/wageTemplateRoutes'));
app.use('/api/rate-scheduler', require('./routes/rateSchedulerRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/hanger-spaces', require('./routes/hangerSpaceRoutes'));
app.use('/api/sell-requests', require('./routes/sellRequestRoutes'));
// Mount invite routes BEFORE trips routes so public verify doesn't hit auth middleware
app.use('/api/staff-invite', require('./routes/staffInviteRoutes'));
app.use('/api/staff-records', require('./routes/staffRecordRoutes'));
app.use('/api/staff', require('./routes/staffTripRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/lab', require('./routes/labSampleRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/knn', require('./routes/knnRoutes'));
app.use('/api/stock-history', require('./routes/stockHistoryRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/salary', require('./routes/salaryRoutes'));
app.use('/api/daily-wage', require('./routes/dailyWageRoutes'));
app.use('/api/monthly-wage', require('./routes/monthlyWageRoutes'));
app.use('/api/unified-salary', require('./routes/unifiedSalaryRoutes'));

// New dashboard routes
app.use('/api/staff-dashboard', require('./routes/staffDashboard'));
app.use('/api/manager-dashboard', require('./routes/managerDashboard'));
app.use('/api/admin-dashboard', require('./routes/adminDashboard'));
app.use('/api/user-dashboard', require('./routes/userDashboard'));

// Optional notifications endpoint (placeholder controller inline)
app.post('/api/notifications/staff-trip-event', async (req, res) => {
    try {
        const { userId, title, message, link, meta, targetRole } = req.body || {};
        const Notification = require('./models/Notification');
        const User = require('./models/userModel');

        // If a specific userId is provided, notify that user
        if (userId) {
            await Notification.create({ userId, title: title || 'Trip Update', message: message || 'Status changed', link, meta });
            return res.json({ ok: true });
        }

        // Broadcast to role (e.g., lab)
        if (targetRole) {
            const role = String(targetRole).toLowerCase();
            const users = await User.find({ role: role.includes('lab') ? 'lab' : role, status: 'active' }).select('_id').lean();
            if (users.length) {
                const docs = users.map(u => ({ userId: u._id, title: title || 'Update', message: message || 'Status changed', link, meta }));
                await Notification.insertMany(docs);
            }
            return res.json({ ok: true, delivered: users.length });
        }

        // Fallback: if only meta.userEmail provided, skip for now
        return res.json({ ok: true });
    } catch (e) {
        res.json({ ok: false, error: e?.message || 'error' });
    }
});

// Optional: Simple test route
app.get('/', (req, res) => {
    res.send('Holy Family Polymers API is running...');
});

// Seed default Lab Staff user if not exists
(async () => {
    try {
        const User = require('./models/userModel');
        const email = 'labstaff@xyz.com';
        const existing = await User.findOne({ email }).lean();
        if (!existing) {
            await User.create({
                name: 'Lab Staff',
                email,
                phoneNumber: '9876543210',
                password: 'labstaff@123',
                role: 'lab',
                status: 'active'
            });
            console.log('Seeded default Lab Staff user:', email);
        }
    } catch (e) {
        console.warn('Failed to seed default Lab Staff user:', e?.message || e);
    }
})();

// Start the server only after DB connection is established
const PORT = process.env.PORT || 5000;
const http = require('http');
const setupWebSocketServer = require('./websocketServer');

(async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    // Set up WebSocket server
    const wss = setupWebSocketServer(server);

    server.listen(PORT, () => {
      console.log(`HTTP Server running on port ${PORT}`);
      console.log(`WebSocket Server is running on ws://localhost:${PORT}`);
      // Start the rate scheduler after server starts
      setTimeout(() => {
        try {
          rateScheduler.start();
          console.log('Rate scheduler initialized');
        } catch (e) {
          console.warn('Rate scheduler failed to start:', e?.message || e);
        }
      }, 2000);
    });
  } catch (e) {
    console.error('Failed to initialize server:', e?.message || e);
    process.exit(1);
  }
})();
