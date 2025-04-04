import axios from 'axios';
import authHeader from './auth-header';
import AuthService from './auth.service';

// Default API URL
const getServerUrl = () => {
    // Production environment - use relative paths to let nginx handle the proxy
    if (process.env.NODE_ENV === 'production') {
        return '';  // Empty base URL to use relative paths
    }

    // Development environment - use localhost with backend port
    // Use env var if available, otherwise default to 8080
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
            // Add timestamp to querystring to prevent caching (especially for IE)
            const separator = config.url.indexOf('?') === -1 ? '?' : '&';
            config.url = `${config.url}${separator}_ts=${new Date().getTime()}`;

            // Ensure API requests have the correct baseURL - but don't modify relative URLs in production
            if (config.url && config.url.startsWith('/api/') && process.env.NODE_ENV !== 'production') {
                config.baseURL = baseURL;
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