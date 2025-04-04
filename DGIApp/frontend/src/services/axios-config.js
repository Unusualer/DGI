import axios from 'axios';
import authHeader from './auth-header';
import AuthService from './auth.service';

// Default API URL
const getServerUrl = () => {
    // In production, use empty base URL to route through nginx
    if (process.env.NODE_ENV === 'production') {
        return '';  // Empty means relative URLs
    }

    // Development environment - use localhost with backend port
    const backendPort = process.env.REACT_APP_BACKEND_PORT || '8080';
    return `http://localhost:${backendPort}`;
};

// Set default base URL
const baseURL = getServerUrl();

// Configure axios
const setupAxios = () => {
    // Set the base URL globally
    axios.defaults.baseURL = baseURL;

    // Request interceptor for adding auth headers and logging
    axios.interceptors.request.use(
        (config) => {
            // Add timestamp to prevent caching
            const separator = config.url.indexOf('?') === -1 ? '?' : '&';
            config.url = `${config.url}${separator}_ts=${new Date().getTime()}`;

            // In production we want relative URLs to go through the nginx proxy
            if (process.env.NODE_ENV === 'production') {
                // Remove any baseURL setting for API paths
                if (config.url && config.url.startsWith('/api/')) {
                    delete config.baseURL;
                }
            } else {
                // In development, ensure API requests have the correct baseURL
                if (config.url && config.url.startsWith('/api/')) {
                    config.baseURL = baseURL;
                }
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            // Don't log sensitive information in production
            if (process.env.NODE_ENV !== 'production') {
                // Simplified error logging in development only
                if (error.response) {
                    console.error(`API Error: ${error.response.status} - ${error.config?.url}`);
                } else {
                    console.error(`API Error: ${error.message}`);
                }
            }

            // Handle 401 errors or other special cases here

            // Retry only GET requests with 5xx server errors
            const { config } = error;

            // Only retry GET requests with server errors (5xx)
            if (config && error.response && error.response.status >= 500 && config.method === 'get') {
                // Simple retry logic
                return new Promise((resolve) => {
                    setTimeout(() => resolve(axios(config)), 1000);
                });
            }

            return Promise.reject(error);
        }
    );
};

export { getServerUrl, setupAxios }; 