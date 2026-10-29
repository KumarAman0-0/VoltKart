require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const sellerRoutes = require('./routes/seller');
const adminRoutes = require('./routes/admin');
const agentRoutes = require('./routes/agent');
const engineerRoutes = require('./routes/engineer');
const buyerRoutes = require('./routes/buyer');
const inspectionRoutes = require('./routes/inspection');
const counterOfferRoutes = require('./routes/counterOffer');
const http = require('http');
const { initSocket } = require('./socket');

const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);

// Connect DB
connectDB();

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.voltkart.in') || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging in dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'VoltKart API is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sell-requests', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent/pickups', agentRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/diagnostic', inspectionRoutes);
app.use('/api/warehouse/devices', engineerRoutes);
app.use('/api/counter-offers', counterOfferRoutes);
app.use('/api', buyerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`VoltKart server & Socket.io running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = { app, httpServer };
