import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaTrain, FaEnvelope, FaShieldAlt, FaClock, FaArrowLeft, FaBuilding, FaMapMarkerAlt, FaPhone, FaRedo } from 'react-icons/fa';

const Login = () => {
  const { sendOTP, verifyOTP, loading, otpSent, expiryTime, setOtpSent, setExpiryTime, setEmailOrPhone, clearAuthData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (expiryTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(expiryTime).getTime();
        const timeLeft = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setTimeLeft(timeLeft);
        
        if (timeLeft === 0) {
          setOtpSent(false);
          setExpiryTime(null);
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [expiryTime, setOtpSent, setExpiryTime]);

  const loadStations = async () => {
    try {
      setStationsLoading(true);
      setStationsError('');
      
      const response = await api.get('/api/stations');
      
      if (response.data && response.data.length > 0) {
        setStations(response.data);
      } else {
        setStationsError('No stations available');
        toast.error('No railway stations found. Please contact support.');
      }
    } catch (error) {
      console.error('Error loading stations:', error);
      setStationsError('Failed to load stations');
      
      if (error.response?.status === 401) {
        // This shouldn't happen for public endpoint, but handle it
        setStationsError('Authentication error. Please clear your session and try again.');
      } else {
        toast.error('Failed to load railway stations. Please try again.');
      }
    } finally {
      setStationsLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!selectedStation) {
      setError('Please select your railway station');
      return;
    }
    
    const station = stations.find(s => s.id === parseInt(selectedStation));
    if (!station) {
      setError('Invalid station selected');
      return;
    }
    
    const success = await sendOTP(email.trim(), null, station.code);
    if (success) {
      setError('');
    } else {
      setError('Failed to send OTP. Please check your email and station selection.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    
    const success = await verifyOTP(otp.trim());
    if (success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError('Invalid OTP. Please try again.');
      setOtp(''); // Clear the OTP field
    }
  };

  const handleClearSession = () => {
    clearAuthData();
    setError('');
    setEmail('');
    setOtp('');
    setSelectedStation('');
    setOtpSent(false);
    setExpiryTime(null);
    loadStations(); // Reload stations
    toast.info('Session cleared. Please try logging in again.');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = async () => {
    if (!email || !selectedStation) return;
    
    const station = stations.find(s => s.id === parseInt(selectedStation));
    if (station) {
      await sendOTP(email, null, station.code);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 gradient-railway rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-bounce-in">
            <FaTrain className="w-10 h-10 text-white" />
          </div>
          <h2 className="heading-primary text-gradient">Railway Parcel Management</h2>
          <p className="mt-2 text-slate-600 font-medium">
            {otpSent ? 'Enter verification code' : 'Sign in to your station account'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-slide-down">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaShieldAlt className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
            {stationsError && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <button
                  onClick={handleClearSession}
                  className="btn-outline text-red-600 border-red-300 hover:bg-red-50 text-sm"
                >
                  <FaRedo className="w-4 h-4 mr-2" />
                  Clear Session & Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        <div className="card-elevated animate-slide-up">
          <div className="card-body">
            {!otpSent ? (
              <form className="space-y-6" onSubmit={handleSendOTP}>
                <div>
                  <label htmlFor="email" className="form-label flex items-center">
                    <FaEnvelope className="w-4 h-4 mr-2 text-blue-600" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="Enter your station email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="station" className="form-label flex items-center">
                    <FaBuilding className="w-4 h-4 mr-2 text-green-600" />
                    Railway Station
                  </label>
                  
                  {stationsLoading ? (
                    <div className="form-input flex items-center justify-center py-4">
                      <LoadingSpinner size="small" />
                      <span className="ml-2 text-slate-500">Loading stations...</span>
                    </div>
                  ) : stationsError ? (
                    <div className="form-input bg-red-50 border-red-200 text-red-700 flex items-center">
                      <FaShieldAlt className="w-4 h-4 mr-2" />
                      {stationsError}
                    </div>
                  ) : (
                    <select
                      id="station"
                      name="station"
                      required
                      className="form-input"
                      value={selectedStation}
                      onChange={(e) => setSelectedStation(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select your station</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name} ({station.code})
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {stations.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500 flex items-center">
                      <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                      {stations.length} railway stations available
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || stationsLoading || stationsError}
                  className="btn-primary w-full py-3 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="w-5 h-5 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleVerifyOTP}>
                <div className="text-center">
                  <div className="w-16 h-16 gradient-railway-success rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FaEnvelope className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-slate-700 font-medium">
                    We've sent a verification code to
                  </p>
                  <p className="text-blue-600 font-bold">{email}</p>
                </div>

                <div>
                  <label htmlFor="otp" className="form-label flex items-center justify-center">
                    <FaShieldAlt className="w-4 h-4 mr-2 text-green-600" />
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength="6"
                    className="form-input text-center text-2xl font-bold tracking-widest"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    autoComplete="one-time-code"
                  />
                </div>

                {timeLeft > 0 && (
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                      <FaClock className="w-4 h-4 text-amber-600 mr-2" />
                      <span className="text-amber-700 font-medium">
                        Code expires in {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="btn-primary w-full py-3 text-base font-semibold"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Verifying...</span>
                      </>
                    ) : (
                      <>
                        <FaShieldAlt className="w-5 h-5 mr-2" />
                        Verify & Sign In
                      </>
                    )}
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading || timeLeft > 0}
                      className="btn-outline flex-1"
                    >
                      <FaRedo className="w-4 h-4 mr-2" />
                      Resend Code
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setError('');
                      }}
                      className="btn-ghost flex-1"
                    >
                      <FaArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact your station administrator
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-slate-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              System Online
            </div>
            <div className="flex items-center">
              <FaShieldAlt className="w-3 h-3 mr-1" />
              Secure Login
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 