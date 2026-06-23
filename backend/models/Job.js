import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please add company name'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Please add job title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add job description'],
  },
  requirements: {
    type: String,
    required: [true, 'Please add key requirements'],
  },
  location: {
    type: String,
    required: [true, 'Please add location'],
    trim: true,
  },
  ctc: {
    type: Number,
    required: [true, 'Please add salary package (CTC) in LPA'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
