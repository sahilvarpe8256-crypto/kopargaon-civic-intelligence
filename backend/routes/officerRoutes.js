import express from 'express';
import { 
  getOfficerReports, 
  calculatePriorityRecommendation, 
  getResources, 
  submitDecision 
} from '../controllers/officerController.js';

const router = express.Router();

router.get('/reports', getOfficerReports);
router.post('/priority/calculate', calculatePriorityRecommendation);
router.get('/resources', getResources);
router.post('/decisions', submitDecision);

export default router;
