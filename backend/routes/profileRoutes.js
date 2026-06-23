import express from 'express';
import {
  getMyProfile,
  getStudentProfileById,
  updateMyProfile,
  uploadMyResume,
} from '../controllers/profileController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/me', protect, authorize('student'), getMyProfile);
router.put('/me', protect, authorize('student'), updateMyProfile);
router.post('/resume', protect, authorize('student'), uploadResume, uploadMyResume);
router.get('/user/:userId', protect, authorize('recruiter', 'admin'), getStudentProfileById);

export default router;
