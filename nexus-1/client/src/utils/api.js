
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  // Vite proxy will handle the /api prefix forwarding to localhost:3001
  baseURL: '', 
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
