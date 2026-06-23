import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import StudentProfile from './models/StudentProfile.js';

dotenv.config();

const runTest = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const email = `test-${Date.now()}@test.com`;
    console.log(`Attempting to register test student with email: ${email}`);

    // Simulate User.create
    const user = await User.create({
      name: 'Test Student',
      email: email,
      password: 'password123',
      role: 'student',
    });
    console.log('User created:', user._id);

    // Simulate StudentProfile.create
    const profile = await StudentProfile.create({
      user: user._id,
      rollNumber: 'NOT_SET',
      department: 'NOT_SET',
      cgpa: 0,
      skills: [],
      experience: '',
      contactNumber: '',
    });
    console.log('StudentProfile created successfully!');

    // Cleanup
    await StudentProfile.deleteOne({ _id: profile._id });
    await User.deleteOne({ _id: user._id });
    console.log('Test completed successfully and data cleaned up!');
    process.exit(0);
  } catch (error) {
    console.error('TEST ERROR DETECTED:');
    console.error(error);
    process.exit(1);
  }
};

runTest();
