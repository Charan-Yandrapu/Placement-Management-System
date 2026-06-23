import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import StudentProfile from './models/StudentProfile.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to DB
connectDB();

const importData = async () => {
  try {
    // Clear all previous data
    await Application.deleteMany();
    await Job.deleteMany();
    await StudentProfile.deleteMany();
    await User.deleteMany();

    console.log('Database cleared...');

    // Create users
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@careergate.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Jane Doe (Student)',
        email: 'student@careergate.com',
        password: 'student123',
        role: 'student',
      },
      {
        name: 'Tech Corp Recruiter',
        email: 'recruiter@careergate.com',
        password: 'recruiter123',
        role: 'recruiter',
      },
    ]);

    const admin = users[0];
    const student = users[1];
    const recruiter = users[2];

    console.log('Users seeded...');

    // Create initial Student Profile for Jane Doe
    await StudentProfile.create({
      user: student._id,
      rollNumber: 'CS2026042',
      department: 'Computer Science & Engineering',
      cgpa: 9.2,
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'CSS', 'Git'],
      experience: 'Summer Internship at WebSolutions working on front-end components. Developed a dashboard visualization page.',
      contactNumber: '+1 555-0199',
    });

    console.log('Student profiles seeded...');

    // Create sample jobs
    const jobs = await Job.create([
      {
        companyName: 'Tech Corp',
        title: 'Full-Stack Developer (MERN)',
        description: 'We are looking for a skilled MERN Stack Developer to join our core engineering team. You will build highly scalable web applications, collaborate with designers and project managers, and write clean, modular code.',
        requirements: 'Proficiency in React.js, Node.js, Express, and MongoDB. Experience with REST APIs, Tailwind CSS, and Git. Solid understanding of JavaScript and asynchronous programming.',
        location: 'San Francisco, CA (Hybrid)',
        ctc: 18, // 18 LPA
        status: 'approved',
        createdBy: recruiter._id,
      },
      {
        companyName: 'InnoSystems',
        title: 'Software Engineer Frontend',
        description: 'Join us to design and build premium web applications. You will focus on performance optimization, responsive rendering, and dynamic micro-animations to create gorgeous, accessible user interfaces.',
        requirements: 'Expertise in HTML5, CSS3, JavaScript, React.js. Knowledge of modern design systems, Tailwind CSS, and SEO fundamentals. Portfolio showing premium UI interfaces.',
        location: 'Austin, TX (Remote)',
        ctc: 14, // 14 LPA
        status: 'approved',
        createdBy: recruiter._id,
      },
      {
        companyName: 'CloudScale',
        title: 'Backend Engineer',
        description: 'Focus on scale, reliability, and security. You will write robust Node.js backend services, manage database queries and aggregations in MongoDB, and secure APIs with JWT authentication.',
        requirements: 'Strong Node.js and Express development background. Advanced knowledge of MongoDB schemas, indexing, and aggregation pipelines. Security best practices (JWT, HTTPS, CORS).',
        location: 'Seattle, WA (On-site)',
        ctc: 22, // 22 LPA
        status: 'pending', // Pending Admin approval
        createdBy: recruiter._id,
      },
    ]);

    console.log('Jobs seeded...');

    // Create a sample application
    await Application.create({
      job: jobs[0]._id, // Full-Stack Developer
      student: student._id,
      status: 'applied',
    });

    console.log('Applications seeded...');
    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data seeding: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Application.deleteMany();
    await Job.deleteMany();
    await StudentProfile.deleteMany();
    await User.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data clearing: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
