import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Railway Parcel Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading ? (
            <LoadingSpinner />
          ) : !otpSent ? (
            <form onSubmit={handleSendOTP}>
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
                  className="form-input"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full btn-primary"
                >
                  Send OTP
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div>
                <label htmlFor="otp" className="form-label">
                  One-Time Password
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="form-input"
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
                  className="w-full btn-primary"
                >
                  Verify OTP
                </button>
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  className="w-full btn-outline"
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
                className="w-full btn-outline"
                onClick={() => navigate('/login')}
              >
                Go to Station Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 