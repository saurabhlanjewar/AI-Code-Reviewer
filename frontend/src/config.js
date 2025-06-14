// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Environment
export const ENV = import.meta.env.VITE_ENV || 'development';

// API Endpoints
export const ENDPOINTS = {
    REVIEW: `${API_URL}/review/`,
    HISTORY: `${API_URL}/history/`,
}; 