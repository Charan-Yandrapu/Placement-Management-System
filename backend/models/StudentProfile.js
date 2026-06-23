import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add roll number'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Please add department'],
    trim: true,
  },
  cgpa: {
    type: Number,
    required: [true, 'Please add CGPA'],
    min: [0, 'CGPA cannot be less than 0'],
    max: [10, 'CGPA cannot exceed 10'],
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  resumeOriginalName: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt date on save
studentProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
