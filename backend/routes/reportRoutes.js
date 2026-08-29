import express from 'express';
import { createReport, getReportById, getReportStatus, getMyReports, submitFeedback } from '../controllers/reportController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', upload.array('images', 5), createReport);
router.get('/my', getMyReports);
router.get('/:reportId/status', getReportStatus);
router.get('/:reportId', getReportById);
router.post('/:reportId/feedback', submitFeedback);

export default router;

