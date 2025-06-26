import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);

  // Logout function - defined first so it can be used in interceptors
  const logout = (showMessage = false) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    delete api.defaults.headers.common['x-auth-token'];
    setCurrentUser(null);
    setEmailOrPhone('');
    setOtpSent(false);
    
    if (showMessage) {
      toast.info('Logged out successfully');
    }
  };

  // Function to clear all authentication data (for error recovery)
  const clearAuthData = () => {
    localStorage.clear(); // Clear all localStorage data
    delete api.defaults.headers.common['x-auth-token'];
    setCurrentUser(null);
    setEmailOrPhone('');
    setOtpSent(false);
    setExpiryTime(null);
  };

  useEffect(() => {
    // Set up API response interceptor to handle authentication errors globally
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          console.log('Authentication error detected, logging out user');
          logout();
          toast.error('Session expired. Please log in again.');
        }
        // Handle user not found (deleted by admin)
        else if (error.response?.status === 404 && error.config.url?.includes('/auth/me')) {
          console.log('User not found (likely deleted by admin), logging out');
          logout();
          toast.error('Your account was not found. Please contact an administrator.');
        }
        // Handle forbidden access
        else if (error.response?.status === 403) {
          console.log('Access forbidden, logging out user');
          logout();
          toast.error('Access denied. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    // Check for saved token and validate user
    const token = localStorage.getItem('token');
    
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      // Always fetch fresh user data from server to avoid stale cache
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Cleanup interceptor on unmount
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      
      // Validate that we have complete user data
      if (response.data && response.data.id && response.data.name && 
          response.data.role && response.data.station) {
        
        // Always use the latest server data, never cache
        setCurrentUser(response.data);
        
        // Update localStorage with fresh data
        localStorage.setItem('user_data', JSON.stringify(response.data));
      } else {
        console.error('Incomplete user data received from server:', response.data);
        logout();
        toast.error('Invalid user data received. Please log in again.');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        console.log('User not found (deleted by admin), clearing session');
        logout();
        toast.error('Your account has been removed. Please contact an administrator.');
      } else if (error.response?.status === 401) {
        console.log('Authentication failed, clearing session');
        logout();
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        console.log('Access forbidden, clearing session');
        logout();
        toast.error('Access denied. Please log in again.');
      } else {
        // For network or other errors, still logout but with different message
        console.log('Authentication error, clearing session');
        logout();
        toast.error('Unable to verify your account. Please log in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email, phone, station_code) => {
    try {
      setLoading(true);
      const contact = email || phone;
      setEmailOrPhone(contact);
      
      console.log(`Sending OTP to ${contact} for station ${station_code}`);
      
      const response = await api.post('/api/auth/send-otp', {
        email,
        phone,
        station_code
      });
      
      console.log('OTP send response:', response.data);
      
      setOtpSent(true);
      setExpiryTime(new Date(response.data.expiresAt));
      toast.success(`OTP sent to ${email ? 'email' : 'phone'}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error.response?.data?.message || 'Error sending OTP';
      const errorDetails = error.response?.data?.error || '';
      toast.error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp) => {
    try {
      setLoading(true);
      
      if (!emailOrPhone) {
        toast.error('Session expired. Please restart the login process.');
        setOtpSent(false);
        return false;
      }
      
      const payload = emailOrPhone.includes('@')
        ? { email: emailOrPhone, otp }
        : { phone: emailOrPhone, otp };
      
      console.log('Verifying OTP with payload:', payload);
      
      const response = await api.post('/api/auth/verify-otp', payload);
      
      console.log('OTP verification response:', response.data);
      
      const { token, user } = response.data;
      
      // Validate complete user data
      if (user && user.id && user.name && user.role && user.station) {
        localStorage.setItem('token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        api.defaults.headers.common['x-auth-token'] = token;
        
        setCurrentUser(user);
        setOtpSent(false);
        toast.success('Login successful');
        return true;
      } else {
        console.error('Incomplete user data received:', user);
        toast.error('Login failed: Incomplete user data');
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // Handle specific error cases for better user experience
      if (error.response?.status === 404) {
        toast.error('User not found. Your account may have been removed. Please contact an administrator.');
      } else if (error.response?.status === 401) {
        toast.error('Invalid OTP. Please try again.');
      } else {
        const errorMessage = error.response?.data?.message || 'Invalid OTP';
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh user data (useful for real-time updates)
  const refreshUserData = async () => {
    if (currentUser) {
      await fetchCurrentUser();
    }
  };

  const value = {
    currentUser,
    loading,
    otpSent,
    setOtpSent,
    expiryTime,
    setExpiryTime,
    emailOrPhone,
    setEmailOrPhone,
    sendOTP,
    verifyOTP,
    logout,
    clearAuthData,
    refreshUserData,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};