import express from 'express';
import { 
  getDashboard, 
  getAllReports, 
  getReportDetail, 
  updateStatus, 
  updatePriority, 
  assignTeam, 
  mergeCluster,
  getAdminResources
} from '../controllers/adminController.js';
import { login } from '../controllers/authController.js';
import { protect, requireOfficer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Login
router.post('/login', login);

// Admin Dashboard stats & Resources
router.get('/dashboard', getDashboard);
router.get('/resources', getAdminResources);

// Admin Report Registry
router.get('/reports', getAllReports);

// Single Report Detail
router.get('/reports/:reportId', getReportDetail);

// Admin Actions
router.patch('/reports/:reportId/status', updateStatus);
router.patch('/reports/:reportId/priority', updatePriority);
router.patch('/reports/:reportId/assign', assignTeam);
router.post('/reports/:reportId/merge', mergeCluster);

export default router;
