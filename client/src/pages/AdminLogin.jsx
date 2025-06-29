import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import DeveloperCredit from '../components/DeveloperCredit';

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  
  // Handle email submission
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!email) {
      toast.error('Email is required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/api/admin/send-otp', { email });
      setOtpSent(true);
      setExpiryTime(new Date(response.data.expiresAt));
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      console.error('Error sending OTP:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!otp) {
      toast.error('OTP is required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/api/admin/verify-otp', { email, otp });
      
      // Clear any existing user session when logging in as admin
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      
      // Save admin token
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('is_admin', 'true');
      
      // Set default Authorization header for future API calls
      api.defaults.headers.common['x-auth-token'] = response.data.token;
      
      toast.success('Login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      console.error('Error verifying OTP:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate remaining time
  const calculateTimeRemaining = () => {
    if (!expiryTime) return { minutes: 0, seconds: 0 };
    
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return { minutes: 0, seconds: 0 };
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    
    return { minutes, seconds };
  };
  
  const { minutes, seconds } = calculateTimeRemaining();
  const timeRemaining = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-beige">
      {/* Animated Icon and Title */}
      <div className="flex flex-col items-center mb-8 animate-fade-in-down">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-lg mb-4 transition-transform duration-300 hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-9 h-9">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 17.25h15a.75.75 0 00.75-.75V6.75A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75v9.75c0 .414.336.75.75.75z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1 text-center">
          Admin Portal
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-2 mx-auto" />
        <p className="text-slate-500 text-center text-base">Railway Parcel Management System</p>
      </div>

      {/* Glassmorphism Card */}
      <div className="bg-white/70 backdrop-blur-lg shadow-2xl shadow-blue-100/40 border border-white/40 rounded-3xl px-4 py-8 w-full max-w-md sm:px-8 sm:py-10 animate-fade-in-up transition-all duration-500">
        {loading ? (
          <LoadingSpinner />
        ) : !otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                Admin Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input rounded-xl bg-white/80 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none shadow-sm transition-all duration-200"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:to-blue-500 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200"
              >
                Send OTP
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="form-label">
                One-Time Password
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="form-input rounded-xl bg-white/80 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none shadow-sm transition-all duration-200"
                placeholder="Enter the OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                OTP expires in {timeRemaining}
              </p>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:to-blue-500 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200"
              >
                Verify OTP
              </button>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="w-full btn-outline rounded-xl"
                onClick={handleSendOTP}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Not an admin?
              </span>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              className="w-full btn-outline rounded-xl"
              onClick={() => navigate('/login')}
            >
              Go to Station Login
            </button>
          </div>
        </div>
      </div>
      {/* Developer Credit */}
      <DeveloperCredit showSocialLinks={true} />
    </div>
  );
};

export default AdminLogin; 