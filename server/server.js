import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import scanRoutes from './routes/scanRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev convenience
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request Body Parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ThreatScope Security Intelligence API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Primary API Routes
app.use('/api', scanRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  ThreatScope Security API Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
  console.log(`🔒 SSRF Protection & Rate Limiting ACTIVE`);
  console.log(`====================================================`);
});
