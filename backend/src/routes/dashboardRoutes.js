const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');

// Resource status & inventory
router.get('/resources', DashboardController.getResources);

// Priority & resource allocation runner
router.post('/prioritize', DashboardController.runPrioritization);

module.exports = router;