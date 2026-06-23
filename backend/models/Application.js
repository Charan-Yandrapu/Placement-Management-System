import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interviewing', 'selected', 'rejected'],
    default: 'applied',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  feedback: {
    type: String,
    default: '',
  },
});

// Avoid multiple applications from the same student for the same job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
