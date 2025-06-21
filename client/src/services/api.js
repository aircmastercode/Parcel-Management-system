import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    // Check for admin token first, then regular user token
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('token');
    
    if (adminToken) {
      config.headers['x-auth-token'] = adminToken;
    } else if (userToken) {
      config.headers['x-auth-token'] = userToken;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // If unauthorized, clear token and redirect to login
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;