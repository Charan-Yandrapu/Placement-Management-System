import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors({
  origin: true, // Automatically reflect the request origin to avoid localhost/127.0.0.1 mismatches
  credentials: true,
}));

// Body parser
app.use(express.json());

// Set static folder for uploaded resumes
// This lets the frontend directly link to and download the resumes
app.use('/uploads', express.static(path.resolve('uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('CareerGate API is running...');
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
