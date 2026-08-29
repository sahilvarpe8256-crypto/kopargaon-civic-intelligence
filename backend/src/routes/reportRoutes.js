const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const upload = require('../middleware/upload');

// Citizen report submission with image upload
router.post('/', upload.single('image'), ReportController.createReport);

// Query report queue
router.get('/', ReportController.getReports);

// Get single report
router.get('/:id', ReportController.getReportById);

// Update status / assign resources
router.patch('/:id/status', ReportController.updateStatus);

module.exports = router;