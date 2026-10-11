const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const config = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const initSocket = require('./sockets/socketHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const providerRoutes = require('./routes/providerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const kycRoutes = require('./routes/kycRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
initSocket(io);

// Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const clientOrigin = config.CLIENT_URL ? config.CLIENT_URL.trim().replace(/\/+$/, '') : 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, mobile or curl (no origin header)
    if (!origin) return callback(null, true);
    // Allow configured CLIENT_URL, local Vite dev servers, or dynamic origin
    if (
      origin === clientOrigin ||
      origin === 'http://localhost:5173' ||
      origin === 'http://localhost:3000' ||
      origin === 'http://127.0.0.1:5173' ||
      config.NODE_ENV === 'development' ||
      clientOrigin === '*'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// Serve static uploaded files (KYC docs, chat images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ServiceMan API',
    timestamp: new Date(),
    environment: config.NODE_ENV
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = config.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[ServiceMan Server] Running in ${config.NODE_ENV} mode on port ${PORT}`);
  console.log(`[ServiceMan API] Health check at http://localhost:${PORT}/api/health`);
});

module.exports = { app, server };
