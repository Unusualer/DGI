import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api/requests/";

// Helper to log HTTP request details
const logRequest = (method, url, headers, data) => {
    console.log(`Sending ${method.toUpperCase()} request to:`, url);
    console.log(`With headers:`, headers);
    if (data) console.log(`With data:`, data);
};

// Create a new request
const createRequest = async (requestData) => {
    try {
        const apiUrl = API_URL + 'create-new';
        console.log(`Creating request at ${apiUrl}`);

        const response = await axios.post(apiUrl, requestData);
        console.log("Raw API response:", response);

        // Check if we have the data
        if (response && response.data) {
            return response.data;
        } else {
            throw new Error("Invalid response format from server");
        }
    } catch (error) {
        console.error("Error creating request:", error);
        throw error;
    }
};

// Test endpoint - create a request without auth
const createRequestTest = async (requestData) => {
    try {
        const testApiUrl = API_URL + "test";
        console.log(`Creating test request at ${testApiUrl}`);

        const response = await axios.post(testApiUrl, requestData);
        return response.data;
    } catch (error) {
        console.error("Error creating test request:", error);
        throw error;
    }
};

// Get all requests (MANAGER role)
const getAllRequests = async () => {
    return axios.get(API_URL);
};

// Get requests created by current user (FRONTDESK role)
const getMySubmissions = async () => {
    return axios.get(API_URL + "my-submissions");
};

// Get requests processed by current user (PROCESSING or MANAGER role)
const getMyProcessedRequests = async () => {
    return axios.get(API_URL + "my-processed");
};

// Get all requests for tracking (all authenticated roles)
const getAllRequestsForTracking = async () => {
    return axios.get(API_URL + "track");
};

// Get requests by state
const getRequestsByState = async (state) => {
    return axios.get(API_URL + "state/" + state);
};

// Search requests by name
const searchRequestsByName = async (query) => {
    return axios.get(API_URL + "search/name?query=" + encodeURIComponent(query));
};

// Search requests by CIN
const searchRequestsByCin = async (query) => {
    return axios.get(API_URL + "search/cin?query=" + encodeURIComponent(query));
};

// Get request by ID
const getRequestById = async (id) => {
    return axios.get(API_URL + id);
};

// Update a request (PROCESSING or MANAGER role)
const updateRequest = async (id, requestData) => {
    return axios.put(API_URL + id, requestData);
};

// Delete a request (MANAGER role only)
const deleteRequest = async (id) => {
    return axios.delete(API_URL + id);
};

// Edit a request by creator within 15 minutes of creation
const editRequest = async (id, requestData) => {
    return axios.put(API_URL + "edit/" + id, requestData);
};

// Bulk update today's requests to EN_TRAITEMENT status
const bulkUpdateTodayRequests = async () => {
    return axios.put(API_URL + "bulk-update-today");
};

// Generate and download a receipt PDF
const generateReceiptPdf = async (id) => {
    return axios.get(API_URL + id + "/receipt", { responseType: 'blob' });
};

// Print receipt - opens a printable receipt in a new window
const printReceipt = async (id) => {
    try {
        if (!id) {
            console.error("Cannot print receipt: No request ID provided");
            throw new Error("Request ID is required to print receipt");
        }

        console.log(`Generating receipt PDF for request ID: ${id}`);
        const response = await generateReceiptPdf(id);

        // Check if response contains data
        if (!response || !response.data) {
            throw new Error("Invalid response from receipt generation");
        }

        // Create blob URL and open in new window for printing
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        console.log(`Created blob URL for PDF: ${url}`);

        const printWindow = window.open(url);
        if (printWindow) {
            printWindow.addEventListener('load', function () {
                printWindow.print();
            });
            return { success: true, message: "Receipt opened for printing" };
        } else {
            throw new Error("Could not open print window. Pop-up blocker might be enabled.");
        }
    } catch (error) {
        console.error("Error printing receipt:", error);
        throw error;
    }
};

const RequestService = {
    createRequest,
    createRequestTest,
    getAllRequests,
    getMySubmissions,
    getMyProcessedRequests,
    getAllRequestsForTracking,
    getRequestsByState,
    searchRequestsByName,
    searchRequestsByCin,
    getRequestById,
    updateRequest,
    deleteRequest,
    editRequest,
    bulkUpdateTodayRequests,
    generateReceiptPdf,
    printReceipt
};

export default RequestService; 