import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import DeveloperCredit from '../components/DeveloperCredit';
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-palette-light">
      {/* Animated Icon and Title */}
      <div className="flex flex-col items-center animate-fade-in mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-palette-mid to-palette-dark flex items-center justify-center shadow-lg mb-3 transition-transform duration-300 hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-9 h-9">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 17.25h15a.75.75 0 00.75-.75V6.75A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75v9.75c0 .414.336.75.75.75z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-palette-dark mb-0 text-center">
          Railway Parcel Management
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-palette-mid to-palette-dark rounded-full mt-2 mb-1 mx-auto" />
        <p className="text-palette-mid text-center text-base mb-2">Sign in to your station account</p>
      </div>
      <div className="mb-6" />

      {/* Glassmorphism Card */}
      <div className="bg-white/90 backdrop-blur-lg shadow-2xl border border-palette-mid rounded-3xl px-8 py-10 w-full max-w-md animate-fade-in-up transition-all duration-500">
        {/* Error Display */}
        {error && (
          <div className="bg-palette-beige border border-palette-mid rounded-2xl p-4 animate-slide-down">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaShieldAlt className="h-5 w-5 text-palette-dark" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-palette-dark">{error}</p>
              </div>
            </div>
            {stationsError && (
              <div className="mt-3 pt-3 border-t border-palette-mid">
                <button
                  onClick={handleClearSession}
                  className="btn-outline text-palette-dark border-palette-mid hover:bg-palette-beige text-sm"
                >
                  <FaRedo className="w-4 h-4 mr-2" />
                  Clear Session & Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        <div className="card-body">
          {!otpSent ? (
            <form className="space-y-6" onSubmit={handleSendOTP}>
              <div>
                <label htmlFor="email" className="form-label flex items-center">
                  <FaEnvelope className="w-4 h-4 mr-2 text-palette-dark" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input rounded-xl bg-white border border-palette-mid focus:border-palette-dark focus:ring-2 focus:ring-palette-dark/20 focus:outline-none shadow-sm transition-all duration-200"
                  placeholder="Enter your station email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="station" className="form-label flex items-center">
                  <FaBuilding className="w-4 h-4 mr-2 text-palette-dark" />
                  Railway Station
                </label>
                
                {stationsLoading ? (
                  <div className="form-input flex items-center justify-center py-4">
                    <LoadingSpinner size="small" />
                    <span className="ml-2 text-palette-mid">Loading stations...</span>
                  </div>
                ) : stationsError ? (
                  <div className="form-input bg-palette-beige border-palette-mid text-palette-dark flex items-center">
                    <FaShieldAlt className="w-4 h-4 mr-2" />
                    {stationsError}
                  </div>
                ) : (
                  <select
                    id="station"
                    name="station"
                    required
                    className="form-input rounded-xl bg-white border border-palette-mid focus:border-palette-dark focus:ring-2 focus:ring-palette-dark/20 focus:outline-none shadow-sm transition-all duration-200"
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
                  <div className="mt-2 text-xs text-palette-mid flex items-center">
                    <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                    {stations.length} railway stations available
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || stationsLoading || stationsError}
                className="w-full py-3 text-base font-semibold rounded-2xl bg-palette-beige text-palette-dark shadow-lg hover:bg-palette-mid hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-palette-dark focus:ring-offset-2 transition-all duration-200"
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
                <div className="w-16 h-16 bg-gradient-to-br from-palette-beige to-palette-mid rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaEnvelope className="w-8 h-8 text-palette-dark" />
                </div>
                <p className="text-palette-dark font-medium">
                  We've sent a verification code to
                </p>
                <p className="text-palette-dark font-bold">{email}</p>
              </div>

              <div>
                <label htmlFor="otp" className="form-label flex items-center justify-center">
                  <FaShieldAlt className="w-4 h-4 mr-2 text-palette-dark" />
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength="6"
                  className="form-input text-center text-2xl font-bold tracking-widest rounded-xl bg-white border border-palette-mid focus:border-palette-dark focus:ring-2 focus:ring-palette-dark/20 focus:outline-none shadow-sm transition-all duration-200"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  autoComplete="one-time-code"
                />
              </div>

              {timeLeft > 0 && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-palette-beige border border-palette-mid rounded-xl">
                    <FaClock className="w-4 h-4 text-palette-dark mr-2" />
                    <span className="text-palette-dark font-medium">
                      Code expires in {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 text-base font-semibold rounded-2xl bg-palette-beige text-palette-dark shadow-lg hover:bg-palette-mid hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-palette-dark focus:ring-offset-2 transition-all duration-200"
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
                    className="btn-outline flex-1 rounded-xl"
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
                    className="btn-ghost flex-1 rounded-xl"
                  >
                    <FaArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-palette-mid">
            Need help? Contact your station administrator
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-palette-mid">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-palette-dark rounded-full mr-2 animate-pulse"></div>
              System Online
            </div>
            <div className="flex items-center">
              <FaShieldAlt className="w-3 h-3 mr-1" />
              Secure Login
            </div>
          </div>
          
          {/* Developer Credit */}
          <div className="w-full">
            <DeveloperCredit showSocialLinks={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 