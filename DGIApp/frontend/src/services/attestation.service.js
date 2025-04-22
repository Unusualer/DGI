import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api/attestations/";

// Create a new attestation
const createAttestation = async (attestationData) => {
    try {
        const apiUrl = API_URL + "create";
        console.log(`Creating attestation at ${apiUrl}`);

        const response = await axios.post(apiUrl, attestationData, { headers: authHeader() });
        console.log("Raw API response:", response);

        // Check if we have the data
        if (response && response.data) {
            return response.data;
        } else {
            throw new Error("Format de réponse invalide du serveur");
        }
    } catch (error) {
        console.error("Erreur lors de la création de l'attestation:", error);
        throw error;
    }
};

// Get all attestations (for MANAGER)
const getAllAttestations = async () => {
    try {
        const response = await axios.get(API_URL, { headers: authHeader() });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des attestations:", error);
        throw error;
    }
};

// Get all attestations for tracking (all roles that need access)
const getAllAttestationsForTracking = async () => {
    try {
        const response = await axios.get(API_URL + "track", { headers: authHeader() });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des attestations:", error);
        throw error;
    }
};

// Get attestations created by current user (for FRONTDESK)
const getMyAttestations = async () => {
    try {
        const response = await axios.get(API_URL + "my-attestations", { headers: authHeader() });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de mes attestations:", error);
        throw error;
    }
};

// Get attestations by type
const getAttestationsByType = async (type) => {
    try {
        const response = await axios.get(API_URL + `type/${type}`, { headers: authHeader() });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des attestations de type ${type}:`, error);
        throw error;
    }
};

// Search attestations by name
const searchAttestationsByName = async (query) => {
    try {
        const response = await axios.get(API_URL + `search/nom?query=${query}`, { headers: authHeader() });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la recherche d'attestations par nom:", error);
        throw error;
    }
};

// Search attestations by CIN
const searchAttestationsByCin = async (query) => {
    try {
        const response = await axios.get(API_URL + `search/cin?query=${query}`, { headers: authHeader() });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la recherche d'attestations par CIN:", error);
        throw error;
    }
};

// Get attestation by ID
const getAttestationById = async (id) => {
    try {
        const response = await axios.get(API_URL + id, { headers: authHeader() });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'attestation ${id}:`, error);
        throw error;
    }
};

// Mark attestation as delivered
const markAttestationAsDelivered = async (id) => {
    try {
        const response = await axios.put(API_URL + `${id}/deliver`, {}, { headers: authHeader() });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la livraison de l'attestation ${id}:`, error);
        throw error;
    }
};

// Generate and download a receipt
const generateReceiptText = async (id) => {
    try {
        const response = await axios.get(API_URL + `${id}/receipt`, {
            headers: authHeader(),
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        console.error(`Erreur lors de la génération du reçu pour l'attestation ${id}:`, error);
        throw error;
    }
};

// Print receipt - opens a printable receipt in a new window
const printReceipt = async (id) => {
    try {
        if (!id) {
            console.error("Cannot print receipt: No attestation ID provided");
            throw new Error("Attestation ID is required to print receipt");
        }

        console.log(`Generating receipt for attestation ID: ${id}`);
        const response = await generateReceiptText(id);

        // Check if response contains data
        if (!response || !response.data) {
            throw new Error("Invalid response from receipt generation");
        }

        // Create blob URL and open in new window for printing
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        console.log(`Created blob URL for receipt: ${url}`);

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

const exportExcel = async () => {
    try {
        const response = await axios.get(API_URL + "exportExcel", {
            headers: {
                ...authHeader(),
            },
            responseType: 'blob',
        });
        return response;
    } catch (error) {
        console.error("Erreur lors de la génération du fichier Excel:", error);
        throw error;
    }
};

const AttestationService = {
    createAttestation,
    getAllAttestations,
    getAllAttestationsForTracking,
    getMyAttestations,
    getAttestationsByType,
    searchAttestationsByName,
    searchAttestationsByCin,
    getAttestationById,
    markAttestationAsDelivered,
    generateReceiptText,
    printReceipt,
    exportExcel
};

export default AttestationService; 