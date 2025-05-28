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
    FormHelperText,
    IconButton,
    Tooltip,
    CircularProgress
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import RequestService from "../services/request.service";
import PrintIcon from '@mui/icons-material/Print';

function CreateRequest() {
    const navigate = useNavigate();
    const [dateEntree, setDateEntree] = useState(new Date());
    const [raisonSocialeNomsPrenom, setRaisonSocialeNomsPrenom] = useState("");
    const [cin, setCin] = useState("");
    const [cinError, setCinError] = useState("");
    const [ifValue, setIfValue] = useState("");
    const [ice, setIce] = useState("");
    const [pmPp, setPmPp] = useState("PP");
    const [objet, setObjet] = useState("");
    const [objetType, setObjetType] = useState("");
    const [customObjet, setCustomObjet] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState("");
    const [requestId, setRequestId] = useState(null);
    const [printingReceipt, setPrintingReceipt] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setLoading(true);
        setError(null);
        setSuccess(null);
        setMessage("");

        if (!raisonSocialeNomsPrenom) {
            setError("Le nom/entreprise est obligatoire");
            setLoading(false);
            return;
        }

        // Require at least one identifier: CIN, IF, or ICE
        if (!cin && !ifValue && !ice) {
            setError("Au moins un identifiant (CIN, IF ou ICE) est obligatoire");
            setLoading(false);
            return;
        }

        // Require objet field
        if (!objetType && !customObjet) {
            setError("L'objet de la demande est obligatoire");
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
            objet: objetType === "autre" ? customObjet : objetType
        };

        try {
            console.log("Submitting request data:", requestData);

            const response = await RequestService.createRequest(requestData);
            console.log("Create request response:", response);

            // Get ID directly from the response - no need for nested checks
            const requestId = response.id;
            console.log("Request created with ID:", requestId);

            setRequestId(requestId);
            setSuccess(`Demande créée avec succès, ID: ${requestId}`);

            // Clear form
            setRaisonSocialeNomsPrenom("");
            setCin("");
            setIfValue("");
            setIce("");
            setPmPp("PP");
            setObjet("");
            setObjetType("");
            setCustomObjet("");
            setDateEntree(new Date());
            setSubmitted(false);
        } catch (error) {
            console.error("Error creating request:", error);
            let errorMessage = "Échec de la création de la demande. Veuillez réessayer.";

            if (error.response) {
                // Handle axios error format
                errorMessage = error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`;
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

    const validateCin = (value) => {
        const cinPattern = /^[A-Za-z]{1,2}\d{4,6}[A-Za-z]{0,2}$/;
        if (value && !cinPattern.test(value)) {
            return "Format CIN invalide: 1-2 lettres + 4-6 chiffres + 0-2 lettres";
        }
        return "";
    };

    const handleCinChange = (e) => {
        const value = e.target.value;
        setCin(value);
        setCinError(validateCin(value));
    };

    // Function to handle printing the receipt
    const handlePrintReceipt = () => {
        if (!requestId) return;

        setPrintingReceipt(true);
        RequestService.printReceipt(requestId)
            .then(() => {
                setMessage("Reçu généré avec succès");
            })
            .catch(err => {
                console.error("Error printing receipt:", err);
                setError("Erreur lors de la génération du reçu: " + (err.message || "Erreur inconnue"));
            })
            .finally(() => {
                setPrintingReceipt(false);
            });
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Créer une Nouvelle Demande
            </Typography>

            <Paper sx={{ p: 4, mt: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Box sx={{ mb: 3 }}>
                        <Alert severity="success" sx={{ mb: 1 }}>
                            {success}
                        </Alert>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Tooltip title="Imprimer le reçu">
                                <IconButton
                                    color="primary"
                                    onClick={handlePrintReceipt}
                                    disabled={printingReceipt}
                                >
                                    {printingReceipt ? <CircularProgress size={24} /> : <PrintIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Date d'entrée"
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
                                label="Nom/Entreprise"
                                value={raisonSocialeNomsPrenom}
                                onChange={(e) => setRaisonSocialeNomsPrenom(e.target.value)}
                                error={submitted && !raisonSocialeNomsPrenom}
                                helperText={submitted && !raisonSocialeNomsPrenom ? "Le nom/entreprise est obligatoire" : ""}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="CIN"
                                value={cin}
                                onChange={handleCinChange}
                                helperText={cinError || (submitted && !hasIdentifier() ? "Au moins un identifiant est obligatoire" : "")}
                                error={!!cinError || (submitted && !hasIdentifier())}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="IF"
                                value={ifValue}
                                onChange={(e) => setIfValue(e.target.value)}
                                helperText={submitted && !hasIdentifier() ? "Au moins un identifiant est obligatoire" : ""}
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
                                helperText={submitted && !hasIdentifier() ? "Au moins un identifiant est obligatoire" : ""}
                                error={submitted && !hasIdentifier()}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth required error={submitted && !objetType && !customObjet}>
                                <InputLabel id="objet-type-label">Type d'objet</InputLabel>
                                <Select
                                    labelId="objet-type-label"
                                    value={objetType}
                                    label="Type d'objet"
                                    onChange={(e) => {
                                        setObjetType(e.target.value);
                                        if (e.target.value !== "autre") {
                                            setObjet(e.target.value);
                                        }
                                    }}
                                >
                                    <MenuItem value="création">Création</MenuItem>
                                    <MenuItem value="modification">Modification</MenuItem>
                                    <MenuItem value="autre">Autre</MenuItem>
                                </Select>
                                {submitted && !objetType && !customObjet && (
                                    <FormHelperText>L'objet de la demande est obligatoire</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {objetType === "autre" && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Objet personnalisé"
                                    value={customObjet}
                                    onChange={(e) => {
                                        setCustomObjet(e.target.value);
                                        setObjet(e.target.value);
                                    }}
                                    multiline
                                    rows={4}
                                    required
                                    error={submitted && !customObjet}
                                    helperText={submitted && !customObjet ? "Veuillez spécifier l'objet de la demande" : ""}
                                    placeholder="Décrivez l'objet de la demande en détail"
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={loading || !raisonSocialeNomsPrenom || !hasIdentifier() || !objetType || (objetType === "autre" && !customObjet)}
                            >
                                {loading ? "Création en cours..." : "Créer la Demande"}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default CreateRequest; 