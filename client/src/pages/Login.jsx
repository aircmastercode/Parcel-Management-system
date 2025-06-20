import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const { sendOTP, verifyOTP, loading, otpSent, expiryTime } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Handle email submission
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    const success = await sendOTP(email);
    if (!success) {
      setError('Failed to send OTP. Please try again.');
    }
  };
  
  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('OTP is required');
      return;
    }
    
    const success = await verifyOTP(otp);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid OTP. Please try again.');
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
          Railway Parcel Management System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Login to access your station dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {loading ? (
            <LoadingSpinner />
          ) : !otpSent ? (
            <form onSubmit={handleSendOTP}>
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input"
                  placeholder="Enter your email"
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
        </div>
      </div>
    </div>
  );
};

export default Login; 