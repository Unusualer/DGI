import axios from "axios";
import { getServerUrl } from "./axios-config";

const API_URL = "/api/auth/";

// Validate if a token has a valid JWT structure (not checking signature)
const isValidTokenFormat = (token) => {
    if (!token || typeof token !== 'string') {
        console.error("Token is missing or not a string");
        return false;
    }

    // JWT consists of 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
        console.error("Token does not have 3 parts");
        return false;
    }

    try {
        // Try to decode the header and payload (should be base64url encoded JSON)
        JSON.parse(atob(parts[0]));
        JSON.parse(atob(parts[1]));
        return true;
    } catch (e) {
        console.error("Failed to parse token parts:", e);
        return false;
    }
};

// Set authorization header for all future API requests
const setAuthHeader = (token) => {
    if (token && isValidTokenFormat(token)) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Auth header set with token:", token.substring(0, 15) + "...");
        console.log("Full Authorization header:", axios.defaults.headers.common["Authorization"]);
    } else {
        delete axios.defaults.headers.common["Authorization"];
        console.log("Auth header removed");
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
    console.log("Login attempt for:", username);
    return axios
        .post(API_URL + "signin", {
            username,
            password,
        })
        .then((response) => {
            console.log("Login successful, saving user data");

            if (response.data.accessToken) {
                // Validate token format before saving
                if (!isValidTokenFormat(response.data.accessToken)) {
                    console.error("Received invalid token format from server");
                } else {
                    console.log("Token format is valid");
                }

                localStorage.setItem("user", JSON.stringify(response.data));

                // Explicitly set the auth header globally for all future requests
                setAuthHeader(response.data.accessToken);

                // Force axios to use the token for all future requests
                axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
                console.log("Auth header forcefully set directly:", axios.defaults.headers.common["Authorization"]);

                // Dispatch an event so other components know authentication changed
                window.dispatchEvent(new Event('auth-change'));
            }

            return response.data;
        });
};

const logout = () => {
    console.log("Logging out user");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];

    // Dispatch an event so other components know authentication changed
    window.dispatchEvent(new Event('auth-change'));
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            console.log("No user found in localStorage");
            return null;
        }

        const user = JSON.parse(userStr);
        console.log("User found in localStorage:", user.username);

        // Set auth header if it's not already set
        if (user && user.accessToken && !axios.defaults.headers.common["Authorization"]) {
            setAuthHeader(user.accessToken);
        }

        return user;
    } catch (error) {
        console.error("Error getting current user:", error);
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

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
    getProfile,
    changePassword,
    setAuthHeader
};

export default AuthService; 