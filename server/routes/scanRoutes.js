import express from 'express';
import {
  performScan,
  getScanHistory,
  getScanByIdController,
  deleteScan,
  clearAllHistoryController,
  getDashboardStats,
  lookupIp,
  lookupDomain,
  analyzeUrlController
} from '../controllers/scanController.js';
import { scanRateLimiter, apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Full scan endpoint
router.post('/scan', scanRateLimiter, performScan);

// Historical reports & single scan details
router.get('/scan/:id', apiRateLimiter, getScanByIdController);
router.get('/history', apiRateLimiter, getScanHistory);
router.delete('/history', apiRateLimiter, clearAllHistoryController);
router.delete('/history/:id', apiRateLimiter, deleteScan);

// Dashboard statistics & charts
router.get('/stats', apiRateLimiter, getDashboardStats);

// Dedicated single-entity investigation endpoints
router.get('/ip/:ip', apiRateLimiter, lookupIp);
router.get('/domain/:domain', apiRateLimiter, lookupDomain);
router.get('/url/analyze', apiRateLimiter, analyzeUrlController);

export default router;
