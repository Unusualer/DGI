import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Grid,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import RequestService from "../services/request.service";

function CreateRequest() {
    const navigate = useNavigate();
    const [dateEntree, setDateEntree] = useState(new Date());
    const [raisonSocialeNomsPrenom, setRaisonSocialeNomsPrenom] = useState("");
    const [cin, setCin] = useState("");
    const [ifValue, setIfValue] = useState("");
    const [ice, setIce] = useState("");
    const [pmPp, setPmPp] = useState("PP");
    const [objet, setObjet] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setLoading(true);
        setError(null);
        setSuccess(null);
        setMessage("");

        if (!raisonSocialeNomsPrenom) {
            setError("Name/Company is required");
            setLoading(false);
            return;
        }

        // Require at least one identifier: CIN, IF, or ICE
        if (!cin && !ifValue && !ice) {
            setError("At least one identifier (CIN, IF, or ICE) is required");
            setLoading(false);
            return;
        }

        // Format the date to ISO string (YYYY-MM-DD)
        const formattedDateEntree = dateEntree.toISOString().split('T')[0];

        const requestData = {
            dateEntree: formattedDateEntree,
            raisonSocialeNomsPrenom,
            cin,
            ifValue,
            ice,
            pmPp,
            objet
        };

        try {
            console.log("Submitting request data:", requestData);

            const response = await RequestService.createRequest(requestData);
            console.log("Create request response:", response);

            // Response can be either from axios or our fetch wrapper
            const responseData = response.data;
            const requestId = responseData.id;

            setSuccess(`Request created successfully with ID: ${requestId}`);

            // Clear form
            setRaisonSocialeNomsPrenom("");
            setCin("");
            setIfValue("");
            setIce("");
            setPmPp("PP");
            setObjet("");
            setDateEntree(new Date());
            setSubmitted(false);
        } catch (error) {
            console.error("Error creating request:", error);
            let errorMessage = "Failed to create request. Please try again.";

            if (error.response) {
                // Handle axios error format
                errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
                console.error("Server response:", error.response.data);
            } else if (error.message) {
                // Handle generic error or fetch error
                errorMessage = error.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Helper to check if at least one identifier is provided
    const hasIdentifier = () => cin || ifValue || ice;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Request
            </Typography>

            <Paper sx={{ p: 4, mt: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Entry Date"
                                    value={dateEntree}
                                    onChange={(newDate) => setDateEntree(newDate)}
                                    renderInput={(params) => <TextField {...params} fullWidth required />}
                                    slotProps={{
                                        textField: { fullWidth: true, required: true },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="pm-pp-label">Type</InputLabel>
                                <Select
                                    labelId="pm-pp-label"
                                    value={pmPp}
                                    label="Type"
                                    onChange={(e) => setPmPp(e.target.value)}
                                >
                                    <MenuItem value="PP">PP (Personne Physique)</MenuItem>
                                    <MenuItem value="PM">PM (Personne Morale)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Name/Company"
                                value={raisonSocialeNomsPrenom}
                                onChange={(e) => setRaisonSocialeNomsPrenom(e.target.value)}
                                error={submitted && !raisonSocialeNomsPrenom}
                                helperText={submitted && !raisonSocialeNomsPrenom ? "Name/Company is required" : ""}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="CIN"
                                value={cin}
                                onChange={(e) => setCin(e.target.value)}
                                helperText={submitted && !hasIdentifier() ? "At least one identifier is required" : ""}
                                error={submitted && !hasIdentifier()}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="IF"
                                value={ifValue}
                                onChange={(e) => setIfValue(e.target.value)}
                                helperText={submitted && !hasIdentifier() ? "At least one identifier is required" : ""}
                                error={submitted && !hasIdentifier()}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="ICE"
                                value={ice}
                                onChange={(e) => setIce(e.target.value)}
                                helperText={submitted && !hasIdentifier() ? "At least one identifier is required" : ""}
                                error={submitted && !hasIdentifier()}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Purpose"
                                value={objet}
                                onChange={(e) => setObjet(e.target.value)}
                                multiline
                                rows={4}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={loading || !raisonSocialeNomsPrenom || !hasIdentifier()}
                            >
                                {loading ? "Creating..." : "Create Request"}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default CreateRequest; 