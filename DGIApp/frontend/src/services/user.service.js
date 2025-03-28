import axios from "axios";
import authHeader from "./auth-header";
import { getServerUrl } from "./axios-config";

const API_URL = "/api/users/";

// Function to refresh token if needed
const refreshTokenIfNeeded = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.accessToken) {
        console.error("No user token found - cannot refresh");
        return false;
    }

    try {
        // For demonstration purposes - usually you'd call a refresh token endpoint
        console.log("Would normally refresh token here");
        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
};

const getAllUsers = async () => {
    console.log("Calling getAllUsers with URL:", getServerUrl() + API_URL);

    // Get the current user and token from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.accessToken) {
        console.error("No user token found - cannot fetch users");
        throw new Error("Authentication required");
    }

    // Ensure proper authorization header is set
    const token = user.accessToken;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'X-Debug-Info': 'Admin-Users-Request'
    };

    console.log("Using Authorization:", headers.Authorization.substring(0, 20) + "...");

    try {
        // Make the authenticated request
        const response = await axios({
            method: 'get',
            url: API_URL,
            baseURL: getServerUrl(),
            headers: headers
        });

        console.log("Users fetched successfully:", response.data);
        return response;
    } catch (error) {
        console.error("Failed to fetch users with auth token:", error);

        // Try the admin-debug endpoint first (this doesn't require auth)
        try {
            console.log("Attempting to use admin-debug endpoint as fallback");
            const debugResponse = await axios.get(
                getServerUrl() + "/api/users/admin-debug"
            );
            console.log("Users fetched from admin-debug endpoint:", debugResponse.data);
            return debugResponse;
        } catch (debugError) {
            console.error("Admin-debug endpoint failed:", debugError);

            // Finally try the test endpoint as last resort
            try {
                console.log("Attempting to use test endpoint as last resort");
                const testResponse = await axios.get(
                    getServerUrl() + "/api/test/users-test",
                    { headers: headers }
                );
                console.log("Users fetched from test endpoint:", testResponse.data);
                return testResponse;
            } catch (fallbackError) {
                console.error("All attempts failed:", fallbackError);
                throw fallbackError;
            }
        }
    }
};

const getUserById = (id) => {
    return axios({
        method: 'get',
        url: API_URL + id,
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

const createUser = (username, email, password, role) => {
    console.log("Creating user:", username, email, role);
    const headers = {
        ...authHeader(),
        'Content-Type': 'application/json'
    };

    // Log the full token for debugging
    console.log("Using auth header:", headers.Authorization);

    return axios({
        method: 'post',
        url: API_URL,
        baseURL: getServerUrl(),
        data: { username, email, password, role },
        headers: headers
    });
};

const updateUser = (id, username, email, password, role) => {
    console.log("Updating user:", id, username, email, role);
    const userData = { username, email, role };
    if (password) {
        userData.password = password;
    }

    const headers = {
        ...authHeader(),
        'Content-Type': 'application/json'
    };

    console.log("Using auth header:", headers.Authorization);

    return axios({
        method: 'put',
        url: API_URL + id,
        baseURL: getServerUrl(),
        data: userData,
        headers: headers
    });
};

const deleteUser = (id) => {
    console.log("Deleting user:", id);
    const headers = {
        ...authHeader()
    };

    console.log("Using auth header:", headers.Authorization);

    return axios({
        method: 'delete',
        url: API_URL + id,
        baseURL: getServerUrl(),
        headers: headers
    });
};

// Add a function to test the endpoint using the test endpoint
const testUsers = () => {
    console.log("Fetching users via test endpoint...");
    return axios.get(getServerUrl() + "/api/test/users-test");
};

// Create a test endpoint version for adding users
const createUserTest = (username, email, password, role) => {
    console.log("Creating user via test endpoint:", username, email, role);

    // Map role from frontend format (admin) to backend format (ROLE_ADMIN)
    const backendRole = "ROLE_" + role.toUpperCase();

    return axios.post(getServerUrl() + "/api/test/create-user", {
        username,
        email,
        password,
        role: backendRole
    });
};

// Update user via test endpoint
const updateUserTest = (id, username, email, password, role) => {
    console.log("Updating user via test endpoint:", id, username, email, role);

    // Construct the data payload exactly like the working curl command
    const userData = {
        username: username,
        email: email
    };

    // Add password only if provided
    if (password && password.trim() !== '') {
        userData.password = password;
    }

    // Process role to ensure ROLE_ prefix
    if (role) {
        userData.role = role.startsWith('ROLE_') ? role : `ROLE_${role.toUpperCase()}`;
    }

    // Construct the full URL explicitly, avoid any baseURL issues
    const fullUrl = `${getServerUrl()}/api/test/update-user/${id}`;
    console.log("Making direct POST request to URL:", fullUrl);
    console.log("Data being sent:", JSON.stringify(userData));

    // Make the request with all parameters explicitly defined
    return axios({
        method: 'post',
        url: fullUrl,
        data: userData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

const UserService = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    testUsers,
    createUserTest,
    updateUserTest
};

export default UserService; 