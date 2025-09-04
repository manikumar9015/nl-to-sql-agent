import axios from 'axios';

// Create a new axios instance with a base URL
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// --- Interceptor ---
// This function will run before every single request is sent.
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;