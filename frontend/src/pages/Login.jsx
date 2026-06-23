import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      setLoadingLocal(true);
      setErrorMessage('');
      const res = await login(email, password);
      
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(res?.message || 'Invalid email or password');
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
        <title>Sign In | CareerGate</title>
        <meta name="description" content="Sign in to CareerGate to access your placement dashboard, apply to jobs, or manage applications." />
      </Helmet>
      
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-800/80 shadow-2xl animate-slide-up">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-600/20 p-3 rounded-2xl text-indigo-400 mb-4 border border-indigo-500/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans text-glow-indigo">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your credentials to access CareerGate
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
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="student@careergate.com"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
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
                  Sign In
                  <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
            <span className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all hover:underline"
              >
                Register here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
