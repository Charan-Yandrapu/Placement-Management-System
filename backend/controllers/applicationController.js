import Application from '../models/Application.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';

// @desc    Apply to a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Student)
export const applyToJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    // Check if job exists and is approved
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }
    if (job.status !== 'approved') {
      res.status(400);
      throw new Error('You cannot apply to a job that has not been approved');
    }

    // Check student profile completion (specifically, rollNumber, department, and resume must exist)
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile || profile.rollNumber === 'NOT_SET' || !profile.resumeUrl) {
      res.status(400);
      throw new Error('Please complete your profile and upload a PDF resume before applying');
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      student: req.user.id,
    });
    if (alreadyApplied) {
      res.status(400);
      throw new Error('You have already applied for this job');
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      student: req.user.id,
      status: 'applied',
    });

    res.status(201).json({
      success: true,
      message: 'Successfully applied to job',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's applications
// @route   GET /api/applications/my
// @access  Private (Student)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate({
        path: 'job',
        select: 'title companyName location ctc',
      })
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a recruiter's job posting
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter, Admin)
export const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    // Only creator of job or admin can view applicants
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view applicants for this job');
    }

    const applicants = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applicants.length,
      applicants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status & feedback
// @route   PUT /api/applications/:id
// @access  Private (Recruiter, Admin)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;

    if (!['applied', 'shortlisted', 'interviewing', 'selected', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    let application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Only job creator or admin can update application status
    if (application.job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update status');
    }

    application.status = status;
    if (feedback !== undefined) {
      application.feedback = feedback;
    }
    
    await application.save();

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed placement statistics (Admin Dashboard)
// @route   GET /api/applications/stats
// @access  Private (Admin)
export const getPlacementStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Placed students (Selected in at least one application)
    const placedStudentsQuery = await Application.distinct('student', { status: 'selected' });
    const totalPlaced = placedStudentsQuery.length;

    const placementRate = totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0;

    // Average salary package of placed students
    const placedApplications = await Application.find({ status: 'selected' }).populate('job', 'ctc');
    let avgCtc = 0;
    if (placedApplications.length > 0) {
      const totalCtc = placedApplications.reduce((acc, app) => acc + (app.job?.ctc || 0), 0);
      avgCtc = Number((totalCtc / placedApplications.length).toFixed(2));
    }

    // Application statuses aggregations
    const statusStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStatusStats = {
      applied: 0,
      shortlisted: 0,
      interviewing: 0,
      selected: 0,
      rejected: 0,
    };

    statusStats.forEach((stat) => {
      if (formattedStatusStats[stat._id] !== undefined) {
        formattedStatusStats[stat._id] = stat.count;
      }
    });

    // Department-wise selections
    // Let's perform a manual lookup/join since StudentProfile is a separate schema
    const profiles = await StudentProfile.find({ resumeUrl: { $ne: '' } }).populate('user');
    const selectedApps = await Application.find({ status: 'selected' });
    const placedStudentIds = new Set(selectedApps.map(a => a.student.toString()));

    const departmentStats = {};
    profiles.forEach((profile) => {
      const dept = profile.department;
      if (dept && dept !== 'NOT_SET') {
        if (!departmentStats[dept]) {
          departmentStats[dept] = { enrolled: 0, placed: 0 };
        }
        departmentStats[dept].enrolled += 1;
        if (placedStudentIds.has(profile.user._id.toString())) {
          departmentStats[dept].placed += 1;
        }
      }
    });

    const formattedDeptStats = Object.keys(departmentStats).map(dept => ({
      name: dept,
      enrolled: departmentStats[dept].enrolled,
      placed: departmentStats[dept].placed,
    }));

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalRecruiters,
        totalJobs,
        totalApplications,
        totalPlaced,
        placementRate,
        avgCtc,
        statusStats: formattedStatusStats,
        departmentStats: formattedDeptStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
