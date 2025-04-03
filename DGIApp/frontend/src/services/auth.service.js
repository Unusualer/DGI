import axios from "axios";
import { getServerUrl } from "./axios-config";

const API_URL = "/api/auth/";

// Validate if a token has a valid JWT structure (not checking signature)
const isValidTokenFormat = (token) => {
    if (!token || typeof token !== 'string') {
        return false;
    }

    // JWT consists of 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }

    try {
        // Try to decode the header and payload (should be base64url encoded JSON)
        JSON.parse(atob(parts[0]));
        JSON.parse(atob(parts[1]));
        return true;
    } catch (e) {
        return false;
    }
};

// Set authorization header for all future API requests
const setAuthHeader = (token) => {
    if (token && isValidTokenFormat(token)) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }
};

const register = (username, email, password) => {
    return axios.post(API_URL + "signup", {
        username,
        email,
        password,
    });
};

const login = (username, password) => {
    // Ensure we're using the correct baseURL for this request
    const url = API_URL + "signin";
    return axios
        .post(url, {
            username,
            password,
        })
        .then((response) => {
            if (response.data.accessToken) {
                // Validate token format before saving
                if (isValidTokenFormat(response.data.accessToken)) {
                    localStorage.setItem("user", JSON.stringify(response.data));

                    // Set the auth header globally for all future requests
                    setAuthHeader(response.data.accessToken);

                    // Force axios to use the token for all future requests
                    axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;

                    // Dispatch an event so other components know authentication changed
                    window.dispatchEvent(new Event('auth-change'));
                }
            }

            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];

    // Dispatch an event so other components know authentication changed
    window.dispatchEvent(new Event('auth-change'));
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            return null;
        }

        const user = JSON.parse(userStr);

        // Set auth header if it's not already set
        const token = user.token || user.accessToken;
        if (user && token && !axios.defaults.headers.common["Authorization"]) {
            setAuthHeader(token);
        }

        return user;
    } catch (error) {
        return null;
    }
};

const getProfile = async () => {
    // Using authorization header from the interceptor or the header set in getCurrentUser
    try {
        return await axios.get(getServerUrl() + '/api/auth/profile');
    } catch (error) {
        console.error("Error getting profile from standard endpoint:", error);

        // If the standard endpoint fails, try to create a profile response from localStorage
        try {
            console.log("Creating fallback profile from localStorage");
            const user = getCurrentUser();
            if (user) {
                return {
                    data: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                };
            }
        } catch (fallbackError) {
            console.error("Fallback profile creation failed:", fallbackError);
        }

        // If all fails, rethrow the original error
        throw error;
    }
};

const changePassword = async (newPassword) => {
    return axios.post(
        getServerUrl() + '/api/auth/change-password',
        { newPassword },
        { headers: { 'Content-Type': 'application/json' } }
    );
};

// Check if current token is valid
const isTokenValid = () => {
    const user = getCurrentUser();
    if (!user) {
        return false;
    }

    const token = user.token || user.accessToken;
    if (!token) {
        return false;
    }

    try {
        // Parse the JWT payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        // Check if token is expired
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp < currentTime) {
            console.log(`Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error validating token:", error);
        // Return false on parsing errors to force re-authentication
        return false;
    }
};

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
    getProfile,
    changePassword,
    setAuthHeader,
    isTokenValid
};

export default AuthService; 