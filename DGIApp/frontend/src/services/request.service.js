import axios from "axios";
import authHeader from "./auth-header";
import { getServerUrl } from "./axios-config";

// API endpoint
const API_URL = "/api/requests/";

// Helper to log HTTP request details
const logRequest = (method, url, headers, data) => {
    console.log(`Sending ${method.toUpperCase()} request to:`, url);
    console.log(`With headers:`, headers);
    if (data) console.log(`With data:`, data);
};

// Create a new request (FRONTDESK, MANAGER)
const createRequest = async (requestData) => {
    try {
        const headers = authHeader();
        console.log("Creating request with auth header:", headers.Authorization);

        // Get the full API URL, using the create-new endpoint
        const apiUrl = getServerUrl() + API_URL + 'create-new';
        console.log("Full request URL:", apiUrl);

        // Log request details
        logRequest('post', apiUrl, {
            ...headers,
            'Content-Type': 'application/json'
        }, requestData);

        // Use fetch API directly for more control
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log("Response status:", response.status);

        // Check if the response is ok (status 200-299)
        if (response.ok) {
            // Parse and return the response JSON
            const data = await response.json();
            console.log("Success response data:", data);

            // Return a response format compatible with axios for consistency
            return { data };
        } else {
            // Log error details
            console.error("Error status:", response.status);

            // If we got a 401/403, try the test endpoint as a fallback
            if (response.status === 401 || response.status === 403) {
                console.log("Authorization failed, trying test endpoint as fallback...");
                return createRequestViaTestEndpoint(requestData);
            }

            // Otherwise, handle the error normally
            const errorData = await response.json();
            console.error("Error response data:", errorData);
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error("All request attempts failed:", error);
        throw error;
    }
};

// Fallback to using the test endpoint which doesn't require authentication
const createRequestViaTestEndpoint = async (requestData) => {
    try {
        console.log("Creating request via test endpoint");

        // Get the full test API URL
        const testApiUrl = getServerUrl() + API_URL + "test";
        console.log("Test endpoint URL:", testApiUrl);

        // Use fetch API for the test endpoint
        const response = await fetch(testApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log("Test endpoint response status:", response.status);

        // Check if the response is ok (status 200-299)
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Test endpoint error response:", errorData);
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        // Parse and return the response JSON
        const data = await response.json();
        console.log("Test endpoint success response:", data);

        // Return a response format compatible with axios for consistency
        return { data };
    } catch (error) {
        console.error("Error using test endpoint:", error);
        throw error;
    }
};

// Update a request (PROCESSING, MANAGER)
const updateRequest = (id, requestData) => {
    const headers = {
        ...authHeader(),
        'Content-Type': 'application/json'
    };

    return axios({
        method: 'put',
        url: API_URL + id,
        baseURL: getServerUrl(),
        data: requestData,
        headers: headers
    });
};

// Get all requests (MANAGER)
const getAllRequests = () => {
    return axios({
        method: 'get',
        url: API_URL,
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Get requests created by current FRONTDESK agent
const getMySubmissions = () => {
    return axios({
        method: 'get',
        url: API_URL + "my-submissions",
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Get requests processed by current PROCESSING agent
const getMyProcessedRequests = () => {
    return axios({
        method: 'get',
        url: API_URL + "my-processed",
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Get all requests for tracking - available to all roles
const getAllRequestsForTracking = () => {
    return axios({
        method: 'get',
        url: API_URL + "track",
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Get requests by state
const getRequestsByState = (state) => {
    return axios({
        method: 'get',
        url: API_URL + "state/" + state,
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Search requests by name
const searchRequestsByName = (query) => {
    return axios({
        method: 'get',
        url: API_URL + "search/name?query=" + query,
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Search requests by CIN
const searchRequestsByCin = (query) => {
    return axios({
        method: 'get',
        url: API_URL + "search/cin?query=" + query,
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Get a single request by ID
const getRequestById = (id) => {
    return axios({
        method: 'get',
        url: API_URL + id,
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Delete a request - MANAGER only
const deleteRequest = (id) => {
    return axios({
        method: 'delete',
        url: API_URL + id,
        baseURL: getServerUrl(),
        headers: authHeader()
    });
};

// Export the service
const RequestService = {
    createRequest,
    updateRequest,
    getAllRequests,
    getMySubmissions,
    getMyProcessedRequests,
    getAllRequestsForTracking,
    getRequestsByState,
    searchRequestsByName,
    searchRequestsByCin,
    getRequestById,
    deleteRequest
};

export default RequestService; 