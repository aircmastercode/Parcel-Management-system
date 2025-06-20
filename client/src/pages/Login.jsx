import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Login = () => {
  const { sendOTP, verifyOTP, loading, otpSent, expiryTime } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const [stations, setStations] = useState([]);
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Fetch stations when component mounts
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get('/api/stations');
        setStations(response.data);
      } catch (err) {
        console.error('Error fetching stations:', err);
      }
    };
    
    fetchStations();
  }, []);
  
  // Handle email submission
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setDebug('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setDebug(`Attempting to send OTP to ${email}...`);
    
    try {
      const success = await sendOTP(email);
      if (!success) {
        setError('Failed to send OTP. Please try again.');
        setDebug(`Failed to send OTP to ${email}. Please check if this is a valid email for a railway station user.`);
      } else {
        setDebug(`OTP sent successfully to ${email}. Check server console for OTP code.`);
      }
    } catch (err) {
      console.error('Error in handleSendOTP:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    }
  };
  
  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setDebug('');
    
    if (!otp) {
      setError('OTP is required');
      return;
    }
    
    setDebug(`Attempting to verify OTP ${otp}...`);
    
    try {
      const success = await verifyOTP(otp);
      if (success) {
        setDebug('OTP verification successful. Redirecting...');
        navigate(from, { replace: true });
      } else {
        setError('Invalid OTP. Please try again.');
        setDebug('OTP verification failed. Check the server logs for details.');
      }
    } catch (err) {
      console.error('Error in handleVerifyOTP:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
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
          
          {debug && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-blue-700 text-sm">{debug}</p>
            </div>
          )}
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-yellow-700 text-sm">
              <strong>Available Railway Stations:</strong>
              {stations.map(station => (
                <div key={station.id} className="mt-1">
                  <span className="font-semibold">{station.name}</span> ({station.code})
                </div>
              ))}
            </p>
          </div>
          
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
                <p className="mt-2 text-sm text-blue-600">
                  Check your email for the OTP code
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
          
          {/* Admin Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Admin Access
                </span>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-800"
              >
                Login as Administrator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 