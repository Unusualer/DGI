import axios from "axios";

const API_URL = "/api/type-attestations";

class TypeAttestationService {
    // Get all types
    getAllTypes() {
        return axios.get(API_URL).then((response) => {
            return response.data;
        });
    }

    // Get a type by ID
    getTypeById(id) {
        return axios.get(`${API_URL}/${id}`).then((response) => {
            return response.data;
        });
    }

    // Create a new type
    createType(typeData) {
        return axios.post(API_URL, typeData).then((response) => {
            return response.data;
        });
    }

    // Update a type
    updateType(id, typeData) {
        return axios.put(`${API_URL}/${id}`, typeData).then((response) => {
            return response.data;
        });
    }

    // Delete a type
    deleteType(id) {
        return axios.delete(`${API_URL}/${id}`).then((response) => {
            return response.data;
        });
    }

    // Search types by label
    searchTypes(query) {
        return axios.get(`${API_URL}/search?query=${query}`).then((response) => {
            return response.data;
        });
    }
}

export default new TypeAttestationService(); 