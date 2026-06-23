import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';

// @desc    Get current student's profile
// @route   GET /api/profile/me
// @access  Private (Student)
export const getMyProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email');
    
    // Lazy creation of student profile if not found
    if (!profile && req.user.role === 'student') {
      profile = await StudentProfile.create({
        user: req.user.id,
        rollNumber: 'NOT_SET',
        department: 'NOT_SET',
        cgpa: 0,
        skills: [],
        experience: '',
        contactNumber: '',
      });
      profile = await StudentProfile.findById(profile._id).populate('user', 'name email');
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile by User ID (for recruiters/admins)
// @route   GET /api/profile/user/:userId
// @access  Private (Recruiter, Admin)
export const getStudentProfileById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.params.userId }).populate('user', 'name email');
    if (!profile) {
      res.status(404);
      throw new Error('Student profile not found');
    }
    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update student profile
// @route   PUT /api/profile/me
// @access  Private (Student)
export const updateMyProfile = async (req, res, next) => {
  try {
    const { rollNumber, department, cgpa, skills, experience, contactNumber } = req.body;

    const profileFields = {
      rollNumber,
      department,
      cgpa: Number(cgpa),
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map(s => s.trim()) : [],
      experience,
      contactNumber,
    };

    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await StudentProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, runValidators: true }
      ).populate('user', 'name email');
    } else {
      // Create
      profileFields.user = req.user.id;
      profile = await StudentProfile.create(profileFields);
      profile = await StudentProfile.findById(profile._id).populate('user', 'name email');
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload PDF resume
// @route   POST /api/profile/resume
// @access  Private (Student)
export const uploadMyResume = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found. Please create profile first.');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a PDF file');
    }

    // Save file url path (local static route url, e.g., /uploads/resumes/filename.pdf)
    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    
    profile.resumeUrl = fileUrl;
    profile.resumeOriginalName = req.file.originalname;
    await profile.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};
