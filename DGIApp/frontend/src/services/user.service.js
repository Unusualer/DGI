import axios from "axios";
import authHeader from "./auth-header";

// Points d'entrée de l'API
// Utiliser l'URL absolue du backend depuis .env.local
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const API_URL = `${API_BASE_URL}/api/users/`;
const TEST_API_URL = `${API_BASE_URL}/api/test/`;

// Fonction utilitaire pour afficher les informations de débogage
const logApiCall = (endpoint, headers) => {
    console.log(`Appel API: ${endpoint}`);
    if (headers && headers.Authorization) {
        const token = headers.Authorization.replace('Bearer ', '').substring(0, 20) + '...';
        console.log(`Token utilisé: ${token}`);
    } else {
        console.warn(`Appel sans en-tête d'autorisation à: ${endpoint}`);
    }
};

// Get public content
const getPublicContent = () => {
    const endpoint = API_URL + "public";
    logApiCall(endpoint);
    return axios.get(endpoint);
};

// Get admin board content - protected route
const getAdminBoard = () => {
    const endpoint = API_URL + "admin";
    const headers = authHeader();
    logApiCall(endpoint, headers);
    return axios.get(endpoint, { headers });
};

// Get front desk agent board content - protected route
const getFrontDeskBoard = () => {
    const endpoint = API_URL + "frontdesk";
    const headers = authHeader();
    logApiCall(endpoint, headers);
    return axios.get(endpoint, { headers });
};

// Get all users (admin only)
const getAllUsers = async () => {
    // Utiliser l'URL complète pour les utilisateurs
    // Pour la compatibilité avec les requêtes de demandes qui fonctionnent
    const endpoint = `${API_BASE_URL}/api/users`;
    console.log("Récupération de tous les utilisateurs depuis:", endpoint);

    const headers = authHeader();
    if (!headers.Authorization) {
        console.error("Aucun token d'authentification disponible pour la requête");
        throw new Error("Authorization token is missing");
    }

    console.log("En-têtes pour getAllUsers:", headers);

    try {
        const response = await axios.get(endpoint, {
            headers,
            // Utilisation d'Axios avec cette configuration spécifique
            baseURL: '', // Désactive la baseURL globale pour cette requête
            // Ne pas utiliser withCredentials avec CORS * car cela cause des erreurs
            // withCredentials: true, // Inclut les cookies
        });
        console.log("Réponse de getAllUsers:", response.status);
        return response;
    } catch (error) {
        console.error("Erreur dans getAllUsers:", error.message);
        if (error.response) {
            console.error("Détails de l'erreur:", error.response.data);
        }
        throw error;
    }
};

// Get user details by ID (admin only)
const getUserById = async (id) => {
    const endpoint = `${API_URL}${id}`;
    const headers = authHeader();
    logApiCall(endpoint, headers);
    return axios.get(endpoint, { headers });
};

// Create a new user (admin only)
const createUser = async (userData) => {
    const endpoint = `${API_BASE_URL}/api/users`;
    console.log("CRÉATION: Tentative de création d'utilisateur:", userData.username);
    console.log("CRÉATION: URL utilisée:", endpoint);

    const headers = authHeader();
    if (!headers.Authorization) {
        console.error("CRÉATION: Aucun token d'authentification disponible");
        throw new Error("Authorization token is missing");
    }

    console.log("CRÉATION: En-têtes utilisés:", headers);

    try {
        const response = await axios.post(endpoint, userData, {
            headers,
            baseURL: '', // Désactive la baseURL globale
            timeout: 10000 // Ajouter un timeout
        });
        console.log("CRÉATION: Réussite avec statut:", response.status);
        return response;
    } catch (error) {
        console.error("CRÉATION: Échec:", error.message);
        if (error.response) {
            console.error("CRÉATION: Détails:", error.response.data);
            console.error("CRÉATION: Statut:", error.response.status);
        } else if (error.request) {
            console.error("CRÉATION: Aucune réponse reçue du serveur");
        }
        throw error;
    }
};

// Update a user (admin only)
const updateUser = (id, userData) => {
    const endpoint = `${API_BASE_URL}/api/users/${id}`;
    console.log("MISE À JOUR: Tentative de mise à jour de l'utilisateur ID:", id);
    console.log("MISE À JOUR: URL utilisée:", endpoint);
    console.log("MISE À JOUR: Données envoyées:", userData);

    const headers = authHeader();
    if (!headers.Authorization) {
        console.error("MISE À JOUR: Aucun token d'authentification disponible");
        return Promise.reject(new Error("Authorization token is missing"));
    }

    console.log("MISE À JOUR: En-têtes utilisés:", headers);

    // Utiliser directement axios.put avec une promesse standard
    return axios.put(endpoint, userData, {
        headers,
        baseURL: '', // Désactive la baseURL globale
        timeout: 10000 // Ajouter un timeout
    })
        .then(response => {
            console.log("MISE À JOUR: Réussite avec statut:", response.status);
            return response;
        })
        .catch(error => {
            console.error("MISE À JOUR: Échec:", error.message);
            if (error.response) {
                console.error("MISE À JOUR: Détails:", error.response.data);
                console.error("MISE À JOUR: Statut:", error.response.status);
                console.error("MISE À JOUR: URL complète utilisée:", error.config.url);
            } else if (error.request) {
                console.error("MISE À JOUR: Aucune réponse reçue du serveur");
            }
            throw error; // Propager l'erreur
        });
};

// Delete a user (admin only)
const deleteUser = (id) => {
    const endpoint = `${API_BASE_URL}/api/users/${id}`;
    console.log("SUPPRESSION: Tentative de suppression de l'utilisateur avec ID:", id);
    console.log("SUPPRESSION: URL utilisée:", endpoint);

    const headers = authHeader();
    if (!headers.Authorization) {
        console.error("SUPPRESSION: Aucun token d'authentification disponible");
        return Promise.reject(new Error("Authorization token is missing"));
    }

    console.log("SUPPRESSION: En-têtes utilisés:", headers);

    // Utiliser directement axios.delete avec une promesse standard
    return axios.delete(endpoint, {
        headers,
        baseURL: '', // Désactive la baseURL globale
        timeout: 10000 // Ajouter un timeout de 10 secondes
    })
        .then(response => {
            console.log("SUPPRESSION: Réussite avec statut:", response.status);
            return response;
        })
        .catch(error => {
            console.error("SUPPRESSION: Échec:", error.message);
            if (error.response) {
                console.error("SUPPRESSION: Détails:", error.response.data);
                console.error("SUPPRESSION: Statut:", error.response.status);
            } else if (error.request) {
                console.error("SUPPRESSION: Aucune réponse reçue du serveur");
            }
            throw error; // Propager l'erreur
        });
};

// Reassign and delete a user (admin only)
const reassignAndDeleteUser = (id, reassignToUserId) => {
    const endpoint = `${API_BASE_URL}/api/users/reassign-and-delete/${id}?reassignToUserId=${reassignToUserId}`;
    console.log("REASSIGNATION & SUPPRESSION: Tentative pour l'utilisateur ID:", id, "vers l'utilisateur ID:", reassignToUserId);
    console.log("REASSIGNATION & SUPPRESSION: URL utilisée:", endpoint);

    const headers = authHeader();
    if (!headers.Authorization) {
        console.error("REASSIGNATION & SUPPRESSION: Aucun token d'authentification disponible");
        return Promise.reject(new Error("Authorization token is missing"));
    }

    console.log("REASSIGNATION & SUPPRESSION: En-têtes utilisés:", headers);

    return axios.delete(endpoint, {
        headers,
        baseURL: '', // Désactive la baseURL globale
        timeout: 20000 // Ajouter un timeout de 20 secondes car l'opération peut prendre du temps
    })
        .then(response => {
            console.log("REASSIGNATION & SUPPRESSION: Réussite avec statut:", response.status);
            return response;
        })
        .catch(error => {
            console.error("REASSIGNATION & SUPPRESSION: Échec:", error.message);
            if (error.response) {
                console.error("REASSIGNATION & SUPPRESSION: Détails:", error.response.data);
                console.error("REASSIGNATION & SUPPRESSION: Statut:", error.response.status);
            } else if (error.request) {
                console.error("REASSIGNATION & SUPPRESSION: Aucune réponse reçue du serveur");
            }
            throw error; // Propager l'erreur
        });
};

// Get a debug view of admin status
const getAdminDebug = async () => {
    const endpoint = `${API_URL}admin-debug`;
    const headers = authHeader();
    logApiCall(endpoint, headers);
    return axios.get(endpoint, { headers });
};

// Test user API - endpoint qui fonctionne de manière fiable
const getUsersTest = async () => {
    // Utiliser l'URL du serveur explicitement pour ce test
    const endpoint = `${API_BASE_URL}/api/test/users-test`;
    console.log("Récupération des utilisateurs via l'API de test:", endpoint);

    try {
        // Essayer d'abord avec l'en-tête d'authentification
        const headers = authHeader();
        const response = await axios.get(endpoint, {
            headers,
            baseURL: '', // Désactive la baseURL globale
        });
        console.log("API de test réussie avec authentification");
        return response;
    } catch (firstError) {
        console.warn("Échec de l'API de test avec authentification, nouvel essai sans authentification");
        try {
            // Si ça échoue, essayer sans authentification
            const response = await axios.get(endpoint, { baseURL: '' });
            console.log("API de test réussie sans authentification");
            return response;
        } catch (error) {
            console.error("Échec complet de l'API de test:", error.message);
            throw error;
        }
    }
};

// Create a test user (for debugging)
const createTestUser = async (userData) => {
    const endpoint = `${TEST_API_URL}create-user`;
    console.log("Création d'un utilisateur de test:", endpoint);
    return axios.post(endpoint, userData);
};

// Get a single user for testing
const getTestUser = async (id) => {
    const endpoint = `${TEST_API_URL}user/${id}`;
    console.log("Récupération de l'utilisateur de test:", endpoint);
    return axios.get(endpoint);
};

// Update a test user (for debugging)
const updateTestUser = async (id, userData) => {
    const endpoint = `${TEST_API_URL}update-user/${id}`;
    console.log("Mise à jour de l'utilisateur de test:", endpoint);
    return axios.put(endpoint, userData);
};

// Delete a test user (for debugging)
const deleteTestUser = async (id) => {
    const endpoint = `${TEST_API_URL}delete-user/${id}`;
    console.log("Suppression de l'utilisateur de test:", endpoint);
    return axios.delete(endpoint);
};

const UserService = {
    getPublicContent,
    getAdminBoard,
    getFrontDeskBoard,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    reassignAndDeleteUser,
    getAdminDebug,
    getUsersTest,
    createTestUser,
    getTestUser,
    updateTestUser,
    deleteTestUser
};

export default UserService; 