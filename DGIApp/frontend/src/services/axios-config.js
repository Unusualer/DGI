import axios from 'axios';
import authHeader from './auth-header';
import AuthService from './auth.service';

// Configure axios
const setupAxios = () => {
    // Determine base URL based on hostname
    if (window.location.hostname !== 'localhost') {
        // When accessed from external IP, ensure we use the frontend server as proxy
        axios.defaults.baseURL = `http://${window.location.host}`;
    }

    // Set up request interceptor to handle API requests
    axios.interceptors.request.use(
        (config) => {
            // Add timestamp to querystring to prevent caching
            const separator = config.url.indexOf('?') === -1 ? '?' : '&';
            config.url = `${config.url}${separator}_ts=${new Date().getTime()}`;

            // Add auth header if available
            const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).accessToken : null;
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
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

export { setupAxios }; 