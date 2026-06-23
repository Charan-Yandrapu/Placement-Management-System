import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import StudentDashboard from './StudentDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardSelector = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to the dashboard matching the user's role
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'recruiter':
      return <RecruiterDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardSelector;
