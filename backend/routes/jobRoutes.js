import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJobStatus,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('recruiter', 'admin'), createJob)
  .get(protect, getJobs);

router.route('/:id')
  .get(protect, getJobById)
  .delete(protect, authorize('recruiter', 'admin'), deleteJob);

router.put('/:id/status', protect, authorize('admin'), updateJobStatus);

export default router;
