import axios from 'axios';

// Get server URL based on environment
export const getServerUrl = () => {
    // When in development mode (localhost:3000)
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
        console.log('Running in development mode - using backend server directly');
        return 'http://localhost:8080'; // Point directly to the backend
    }

    // When running in production (Docker/nginx)
    return ''; // Use empty string for relative URLs through nginx proxy
};

// Set default base URL
const baseURL = getServerUrl();
axios.defaults.baseURL = baseURL;
console.log('Setting axios.defaults.baseURL to:', baseURL);

// Initialize axios with global configs
const setupAxios = () => {
    // Set default config
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.withCredentials = false; // Set to true if you need to send cookies

    // Request interceptor
    axios.interceptors.request.use(
        (config) => {
            // Ensure content type is set properly
            if (!config.headers['Content-Type'] &&
                (config.method === 'post' || config.method === 'put' || config.method === 'patch')) {
                config.headers['Content-Type'] = 'application/json';
            }

            // Make sure we always have the right baseURL for API requests
            if (config.url && config.url.startsWith('/api/')) {
                config.baseURL = baseURL;
            }

            // Log request details
            console.log(`Request: ${config.method?.toUpperCase() || 'GET'} ${config.baseURL || ''}${config.url || ''}`);
            console.log('Headers:', JSON.stringify(config.headers || {}));

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    axios.interceptors.response.use(
        (response) => {
            // Log successful responses
            console.log(`Response ${response.status} from ${response.config.url}`);
            return response;
        },
        (error) => {
            if (error.response) {
                console.error('API Error:', error.response.status, error.response.data);

                // Log detailed error info
                console.error('URL:', error.config?.url);
                console.error('Method:', error.config?.method);
                console.error('Headers:', error.config?.headers);
                console.error('Data:', error.config?.data);

                // Show the actual response
                if (error.response.data) {
                    console.error('Response data:', error.response.data);
                }
            } else if (error.request) {
                console.error('Request Error (No Response):', error.request);
            } else {
                console.error('Error:', error.message);
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxios; 