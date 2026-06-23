import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, Briefcase, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'recruiter':
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      default:
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {getRoleIcon(role)} Admin
          </span>
        );
      case 'recruiter':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {getRoleIcon(role)} Recruiter
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {getRoleIcon(role)} Student
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
          <GraduationCap className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent font-sans">
          CareerGate
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
              <div className="mt-0.5 flex">{getRoleBadge(user.role)}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all font-medium text-sm border border-transparent hover:border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
