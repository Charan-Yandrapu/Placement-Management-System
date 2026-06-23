import express from 'express';
import {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getPlacementStats,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, authorize('student'), getMyApplications);
router.post('/apply/:jobId', protect, authorize('student'), applyToJob);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.get('/stats', protect, authorize('admin'), getPlacementStats);

export default router;
