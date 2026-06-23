import Job from '../models/Job.js';

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter)
export const createJob = async (req, res, next) => {
  try {
    const { companyName, title, description, requirements, location, ctc } = req.body;

    const job = await Job.create({
      companyName,
      title,
      description,
      requirements,
      location,
      ctc: Number(ctc),
      createdBy: req.user.id,
      // Automatically approved so it immediately shows up on student's dashboard
      status: 'approved',
    });

    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (filtered based on user role)
// @route   GET /api/jobs
// @access  Private (All)
export const getJobs = async (req, res, next) => {
  try {
    let query = {};

    // Students only see approved jobs
    if (req.user.role === 'student') {
      query.status = 'approved';
    } 
    // Recruiters only see their own jobs
    else if (req.user.role === 'recruiter') {
      query.createdBy = req.user.id;
    }
    // Admins see all jobs, but we can accept query parameter filtering if needed (e.g. status=pending)
    else if (req.user.role === 'admin' && req.query.status) {
      query.status = req.query.status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single job details
// @route   GET /api/jobs/:id
// @access  Private (All)
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
    if (!job) {
      res.status(404);
      throw new Error('Job posting not found');
    }

    // Access control
    if (req.user.role === 'student' && job.status !== 'approved') {
      res.status(403);
      throw new Error('Not authorized to view this job');
    }

    if (req.user.role === 'recruiter' && job.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this job');
    }

    res.json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job status (Approve / Reject)
// @route   PUT /api/jobs/:id/status
// @access  Private (Admin)
export const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    let job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    job.status = status;
    await job.save();

    res.json({
      success: true,
      message: `Job status updated to ${status}`,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter, Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    // Only creator or admin can delete
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this job');
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job posting deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
