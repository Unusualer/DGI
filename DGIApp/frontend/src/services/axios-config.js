import axios from 'axios';
import authHeader from './auth-header';
import AuthService from './auth.service';

// Configure axios
const setupAxios = () => {
    // Utiliser l'URL du backend depuis .env.local si disponible
    const apiBaseUrl = process.env.REACT_APP_API_URL || '';

    if (apiBaseUrl) {
        // Si une URL spécifique est fournie dans .env.local, l'utiliser
        axios.defaults.baseURL = apiBaseUrl;
        console.log(`Configuration de l'URL de base pour les requêtes API: ${apiBaseUrl}`);
    } else {
        // Déterminer automatiquement l'URL du backend
        const serverHost = window.location.hostname;
        const serverPort = '8080'; // Port du backend
        const serverProtocol = window.location.protocol;

        // Construire l'URL du backend basée sur l'hôte actuel
        axios.defaults.baseURL = `${serverProtocol}//${serverHost}:${serverPort}`;
        console.log(`Configuration de l'URL de base détectée: ${axios.defaults.baseURL}`);
    }

    // Configuration globale pour CORS
    axios.defaults.withCredentials = false; // Désactiver l'envoi de cookies

    // Pour les requêtes DELETE, s'assurer qu'elles incluent le body si nécessaire
    axios.defaults.headers.delete = {
        'Content-Type': 'application/json'
    };

    // Set up request interceptor to handle API requests
    axios.interceptors.request.use(
        (config) => {
            // Pour déboguer les URL
            console.log(`Requête envoyée à: ${config.url} (méthode: ${config.method})`);

            // Add timestamp to querystring to prevent caching, but only once
            if (!config.url.includes('_ts=')) {
                const separator = config.url.indexOf('?') === -1 ? '?' : '&';
                config.url = `${config.url}${separator}_ts=${new Date().getTime()}`;
            }

            // Add auth header if available
            try {
                const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                if (user) {
                    // Prendre soit token soit accessToken selon ce qui est disponible
                    const token = user.token || user.accessToken;
                    if (token) {
                        config.headers["Authorization"] = `Bearer ${token}`;
                        console.log(`En-tête d'autorisation ajouté pour: ${config.url}`);
                    }
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout de l'en-tête d'autorisation:", error);
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
            // Log successful requests
            console.log(`Réponse reçue avec succès de: ${response.config.url}`);
            return response;
        },
        async (error) => {
            // Log error details
            if (error.response) {
                console.error(`Erreur API: ${error.response.status} - ${error.config?.url}`);
                console.error("URL complète:", error.config?.url);
                console.error("Méthode:", error.config?.method);

                // Handle authentication errors
                if (error.response.status === 401) {
                    console.error("Détails de l'erreur d'authentification:", error.response.data);
                    console.error("En-têtes de la requête:", error.config?.headers);

                    // Check if token is valid
                    const isTokenValid = AuthService.isTokenValid();
                    console.log("Le token est-il valide?", isTokenValid);

                    if (!isTokenValid) {
                        console.warn("Token invalide détecté");

                        // Only redirect to login if we're not already on the login page
                        if (!window.location.pathname.includes('/login')) {
                            console.log("Redirection vers la page de connexion...");
                            // Force logout to clear invalid token
                            AuthService.logout();
                            window.location.href = '/login';
                        }
                    }
                }
            } else {
                console.error(`Erreur API: ${error.message}`);
            }

            // Retry logic for server errors
            const { config } = error;
            if (config && error.response && error.response.status >= 500 && config.method === 'get') {
                return new Promise((resolve) => {
                    console.log(`Nouvelle tentative de la requête après erreur serveur: ${config.url}`);
                    setTimeout(() => resolve(axios(config)), 1000);
                });
            }

            return Promise.reject(error);
        }
    );
};

export { setupAxios }; 