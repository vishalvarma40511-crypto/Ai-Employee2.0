export const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && 
   (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname === '[::1]')
    ? 'http://localhost:5000'
    : window.location.origin);
export const API_BASE = `${API_URL}/api`;
