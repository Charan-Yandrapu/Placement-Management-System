import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Loader2, ArrowLeft, KeyRound, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await api.post('/auth/forgot-password', { email });

      if (res.data.success) {
        setResetUrl(res.data.resetUrl);
        setSubmitted(true);
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
        <title>Forgot Password | CareerGate</title>
        <meta
          name="description"
          content="Reset your CareerGate account password securely."
        />
      </Helmet>

      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-800/80 shadow-2xl animate-slide-up">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="bg-indigo-600/20 p-3 rounded-2xl text-indigo-400 mb-4 border border-indigo-500/20">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans text-glow-indigo">
                  Forgot Password?
                </h1>
                <p className="text-slate-400 text-sm text-center">
                  Enter your registered email address and we'll generate a secure
                  reset link for you.
                </p>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                  {errorMessage}
                </div>
              )}

              {/* Form */}
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
                      id="forgot-email"
                      type="email"
                      required
                      placeholder="student@careergate.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Back to login */}
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
              <div className="flex flex-col items-center mb-8">
                <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-400 mb-4 border border-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2 text-center">
                  Reset Link Ready!
                </h1>
                <p className="text-slate-400 text-sm text-center">
                  In a production app, this link would be sent to{' '}
                  <span className="text-indigo-400 font-medium">{email}</span>.
                  For now, click the link below to reset your password.
                </p>
              </div>

              {/* Reset link display */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Password Reset Link
                </p>
                <a
                  href={resetUrl}
                  className="text-indigo-400 hover:text-indigo-300 text-sm break-all leading-relaxed inline-flex items-start gap-1.5 transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  {resetUrl}
                </a>
              </div>

              <p className="text-xs text-slate-500 text-center mb-6">
                This link expires in <span className="text-amber-400">1 hour</span>. After resetting, it can only be used once.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
