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

  useEffect(() => {
    // Check for saved token
    const token = localStorage.getItem('token');
    
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email, phone) => {
    try {
      setLoading(true);
      const contact = email || phone;
      setEmailOrPhone(contact);
      
      const response = await api.post('/api/auth/send-otp', {
        email,
        phone
      });
      
      setOtpSent(true);
      setExpiryTime(new Date(response.data.expiresAt));
      toast.success(`OTP sent to ${email ? 'email' : 'phone'}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Error sending OTP');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp) => {
    try {
      setLoading(true);
      const payload = emailOrPhone.includes('@')
        ? { email: emailOrPhone, otp }
        : { phone: emailOrPhone, otp };
        
      const response = await api.post('/api/auth/verify-otp', payload);
      
      // Save token and set current user
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['x-auth-token'] = token;
      
      setCurrentUser(user);
      setOtpSent(false);
      setEmailOrPhone('');
      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setCurrentUser(null);
    toast.info('Logged out successfully');
  };

  const value = {
    currentUser,
    loading,
    otpSent,
    expiryTime,
    sendOTP,
    verifyOTP,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 