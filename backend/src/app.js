require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const topicRoutes = require('./routes/topicRoutes');
const logbookRoutes = require('./routes/logbookRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────
// Environment Strictness
// ──────────────────────────────────────────
const requiredSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
const missingSecrets = requiredSecrets.filter(s => !process.env[s] || process.env[s] === 'fallback_secret');
if (missingSecrets.length > 0) {
  logger.error(`FATAL ERROR: Missing or insecure secrets: ${missingSecrets.join(', ')}`);
  process.exit(1);
}

const { v4: uuidv4 } = require('uuid');
const addRequestId = (req, res, next) => {
  req.id = uuidv4();
  next();
};

// ──────────────────────────────────────────
// Security, Parsing, and Performance Middleware
// ──────────────────────────────────────────
app.use(addRequestId);
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
morgan.token('id', req => req.id);
app.use(morgan(':id :method :url :status :res[content-length] - :response-time ms', { 
  stream: { write: (msg) => logger.info(msg.trim()) } 
}));

// ──────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────
app.use('/api/auth', rateLimiter.authLimiter);
app.use('/api', rateLimiter.generalLimiter);

// ──────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'capstonex-backend', timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/logbooks', logbookRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', recommendationRoutes);

// ──────────────────────────────────────────
// 404 Handler
// ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ──────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connected successfully');
    // Sync models in development (creates tables if not exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database models synced');
    }
  } catch (error) {
    logger.warn('⚠️  PostgreSQL not available — running in degraded mode (no DB)');
    logger.warn(`   Connection error: ${error.message}`);
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      logger.info(`🚀 CapstoneX Backend running on port ${PORT}`);
    });
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
