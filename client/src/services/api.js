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
    // Check if this is an admin-specific endpoint
    const isAdminEndpoint = config.url && (
      config.url.includes('/api/admin/') || 
      config.url.includes('/admin/')
    );
    
    // Check for tokens
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('token');
    
    // Use admin token only for admin endpoints, otherwise use user token
    if (isAdminEndpoint && adminToken) {
      config.headers['x-auth-token'] = adminToken;
    } else if (userToken) {
      config.headers['x-auth-token'] = userToken;
    } else if (adminToken && !userToken) {
      // Fallback to admin token if no user token exists
      config.headers['x-auth-token'] = adminToken;
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
        // If unauthorized, clear tokens
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;