import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    setToastMessage('');

    try {
      await login(formData.email, formData.password);
      setToastMessage('Login successful! Redirecting to dashboard...');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Invalid email or password. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Subtle Background Accent Orbs matching Dashboard */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#111827] text-white px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#111827] flex items-center justify-center text-white shadow-md">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#111827]" />
            <span>SpendWise AI Hub</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
            Welcome back
          </h2>
          <p className="text-sm font-medium text-[#64748B]">
            Sign in to access your financial dashboard & AI insights.
          </p>
        </div>

        {/* Form Card (Matching Dashboard SaaS Card Style) */}
        <div className="bg-white border border-[#E2E8F0] p-8 rounded-2xl shadow-sm space-y-6">
          {/* Global API Error Alert */}
          {apiError && (
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full pl-11 pr-4 py-3 bg-white border ${
                    errors.email ? 'border-rose-500' : 'border-[#CBD5E1] focus:border-[#111827]'
                  } rounded-xl text-[#0F172A] font-semibold placeholder-[#94A3B8] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#111827] hover:text-[#475569] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-3 bg-white border ${
                    errors.password ? 'border-rose-500' : 'border-[#CBD5E1] focus:border-[#111827]'
                  } rounded-xl text-[#0F172A] font-semibold placeholder-[#94A3B8] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-rose-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button (Matching Primary Button Styling) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#111827] hover:bg-[#1F2937] text-white font-semibold rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex justify-center items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Card Footer Link */}
          <div className="pt-4 border-t border-[#E2E8F0] text-center">
            <p className="text-sm font-medium text-[#64748B]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#111827] hover:text-[#475569] transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
