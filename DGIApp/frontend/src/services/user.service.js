import axios from "axios";

const API_URL = "/api/users/";
const TEST_API_URL = "/api/test/";

// Get public content
const getPublicContent = () => {
    return axios.get(API_URL + "public");
};

// Get admin board content - protected route
const getAdminBoard = () => {
    return axios.get(API_URL + "admin");
};

// Get front desk agent board content - protected route
const getFrontDeskBoard = () => {
    return axios.get(API_URL + "frontdesk");
};

// Get all users (admin only)
const getAllUsers = async () => {
    // Use the interceptor from axios-config.js for auth headers
    console.log("Calling getAllUsers with URL:", API_URL);
    return axios.get(API_URL);
};

// Get user details by ID (admin only)
const getUserById = async (id) => {
    // Use the interceptor from axios-config.js for auth headers
    return axios.get(`${API_URL}${id}`);
};

// Create a new user (admin only)
const createUser = async (userData) => {
    return axios.post(API_URL, userData);
};

// Update a user (admin only)
const updateUser = async (id, userData) => {
    return axios.put(`${API_URL}${id}`, userData);
};

// Delete a user (admin only)
const deleteUser = async (id) => {
    return axios.delete(`${API_URL}${id}`);
};

// Get a debug view of admin status
const getAdminDebug = async () => {
    return axios.get(`${API_URL}admin-debug`);
};

// Test user API without auth (for debugging)
const getUsersTest = async () => {
    return axios.get(`${TEST_API_URL}users-test`);
};

// Create a test user (for debugging)
const createTestUser = async (userData) => {
    return axios.post(`${TEST_API_URL}create-user`, userData);
};

// Get a single user for testing
const getTestUser = async (id) => {
    return axios.get(`${TEST_API_URL}user/${id}`);
};

// Update a test user (for debugging)
const updateTestUser = async (id, userData) => {
    const fullUrl = `${TEST_API_URL}update-user/${id}`;
    console.log("Updating test user:", fullUrl);
    return axios.put(fullUrl, userData);
};

// Delete a test user (for debugging)
const deleteTestUser = async (id) => {
    return axios.delete(`${TEST_API_URL}delete-user/${id}`);
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
    getAdminDebug,
    getUsersTest,
    createTestUser,
    getTestUser,
    updateTestUser,
    deleteTestUser
};

export default UserService; 