import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User as UserIcon, Loader2, ArrowRight, Briefcase } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'recruiter'
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoadingLocal(true);
      setErrorMessage('');
      const res = await register(name, email, password, role);
      
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(res?.message || 'Registration failed. Try a different email.');
      }
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register | CareerGate</title>
        <meta name="description" content="Create a new account on CareerGate. Sign up as a Student or Recruiter to get started." />
      </Helmet>

      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-800/80 shadow-2xl animate-slide-up">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-indigo-600/20 p-3 rounded-2xl text-indigo-400 mb-4 border border-indigo-500/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans text-glow-indigo">
              Create Account
            </h1>
            <p className="text-slate-400 text-sm">
              Join CareerGate campus recruitment hub
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Register As
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4.5 h-4.5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    role === 'recruiter'
                      ? 'bg-emerald-600/10 border-emerald-500/80 text-emerald-400'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <Briefcase className="w-4.5 h-4.5" />
                  Recruiter
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingLocal || loading}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group active:scale-98"
            >
              {loadingLocal ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-800/80 pt-5">
            <span className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all hover:underline"
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
