import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Validation state
  const hasMinLength = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Countdown redirect after success
  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in both password fields');
      return;
    }
    if (!hasMinLength) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await api.put(`/auth/reset-password/${resetToken}`, { password });

      if (res.data.success) {
        setSuccess(true);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | CareerGate</title>
        <meta
          name="description"
          content="Set a new password for your CareerGate account."
        />
      </Helmet>

      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-800/80 shadow-2xl animate-slide-up">
          {!success ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="bg-indigo-600/20 p-3 rounded-2xl text-indigo-400 mb-4 border border-indigo-500/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans text-glow-indigo">
                  Create New Password
                </h1>
                <p className="text-slate-400 text-sm text-center">
                  Your new password must be at least 6 characters long.
                </p>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input
                      id="reset-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-11 pr-11 py-3 bg-slate-900/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all text-sm ${
                        confirmPassword.length > 0
                          ? passwordsMatch
                            ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500'
                            : 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Inline validation hints */}
                <div className="space-y-1.5 pt-1">
                  <div className={`flex items-center gap-2 text-xs transition-colors ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${hasMinLength ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                    At least 6 characters
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${passwordsMatch ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                    Passwords match
                  </div>
                </div>

                <button
                  type="submit"
                  id="reset-submit-btn"
                  disabled={loading || !hasMinLength || !passwordsMatch}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex flex-col items-center text-center">
                <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-400 mb-5 border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white mb-3">
                  Password Reset Successful!
                </h1>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Your password has been updated successfully. You can now sign in
                  with your new password.
                </p>

                {/* Countdown ring */}
                <div className="flex flex-col items-center gap-2 mb-8">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90 w-14 h-14" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
                      <circle
                        cx="28" cy="28" r="24"
                        fill="none" stroke="currentColor" strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 24}`}
                        strokeDashoffset={`${2 * Math.PI * 24 * (countdown / 3)}`}
                        className="text-indigo-500 transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="relative text-lg font-bold text-indigo-400">{countdown}</span>
                  </div>
                  <p className="text-xs text-slate-500">Redirecting to Sign In...</p>
                </div>

                <Link
                  to="/login"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  Sign In Now
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
