import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    CircularProgress
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import RequestService from "../services/request.service";
import AuthService from "../services/auth.service";

function EditRequest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dateEntree, setDateEntree] = useState(new Date());
    const [raisonSocialeNomsPrenom, setRaisonSocialeNomsPrenom] = useState("");
    const [cin, setCin] = useState("");
    const [cinError, setCinError] = useState("");
    const [ifValue, setIfValue] = useState("");
    const [ice, setIce] = useState("");
    const [pmPp, setPmPp] = useState("PP");
    const [objet, setObjet] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState("");
    const [canEdit, setCanEdit] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [request, setRequest] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Get current user
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);

        // Fetch request details
        fetchRequestDetails();
    }, [id]);

    useEffect(() => {
        // Calculate edit permissions based on role and request creation date
        if (request?.createdAt) {
            const createdAt = new Date(request.createdAt);
            const now = new Date();

            // Extract just the date part (year, month, day) for both dates
            const createdDateStr = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
            const nowDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

            // Check if created on the same calendar date
            const isSameCalendarDate = createdDateStr === nowDateStr;

            // Log detailed timestamp information for debugging
            console.log("EditRequest.js - Time debug info:", {
                createdAtRaw: request.createdAt,
                createdAtParsed: createdAt.toISOString(),
                nowRaw: now.toISOString(),
                createdDateStr,
                nowDateStr,
                isSameCalendarDate
            });

            // No longer using time-based limit
            setTimeLeft(0);

            // Different edit permissions based on role:
            // 1. Managers can edit any request anytime
            // 2. Processing agents can edit any request anytime
            // 3. Frontdesk can only edit their own requests on the same calendar date
            const isFrontdesk = currentUser?.role === "ROLE_FRONTDESK";
            const isManager = currentUser?.role === "ROLE_MANAGER";
            const isProcessing = currentUser?.role === "ROLE_PROCESSING";
            const isCreator = currentUser?.id === request.creatorId;

            const canEditRequest = isManager ||
                isProcessing ||
                (isFrontdesk && isCreator && isSameCalendarDate);

            setCanEdit(canEditRequest);

            console.log("Edit permissions:", {
                role: currentUser?.role,
                isCreator,
                isSameCalendarDate,
                canEdit: canEditRequest
            });
        }
    }, [request, currentUser]);

    const fetchRequestDetails = async () => {
        setInitialLoading(true);
        try {
            const response = await RequestService.getRequestById(id);
            setRequest(response.data);

            // Pre-fill form fields
            if (response.data.dateEntree) {
                setDateEntree(new Date(response.data.dateEntree));
            }
            setRaisonSocialeNomsPrenom(response.data.raisonSocialeNomsPrenom || "");
            setCin(response.data.cin || "");
            setIfValue(response.data.ifValue || "");
            setIce(response.data.ice || "");
            setPmPp(response.data.pmPp || "PP");
            setObjet(response.data.objet || "");

            // Get current user
            const user = AuthService.getCurrentUser();
            if (!user) {
                setError("Utilisateur non authentifié");
                return;
            }

            const isManager = user.role === "ROLE_MANAGER";
            const isProcessing = user.role === "ROLE_PROCESSING";
            const isFrontdesk = user.role === "ROLE_FRONTDESK";
            const isCreator = user.id === response.data.creatorId;

            // Check edit permissions
            if (isFrontdesk && !isCreator) {
                setError("Vous n'êtes pas autorisé à modifier cette demande car vous n'êtes pas son créateur");
                setCanEdit(false);
                return;
            }

            // For frontdesk users, check if request was created on the same calendar date
            if (isFrontdesk) {
                const createdAt = new Date(response.data.createdAt);
                const now = new Date();

                // Extract just the date part for both dates
                const createdDateStr = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
                const nowDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

                // Check if created on the same calendar date
                const isSameCalendarDate = createdDateStr === nowDateStr;

                if (!isSameCalendarDate) {
                    setError("Cette demande ne peut être modifiée que le jour de sa création");
                    setCanEdit(false);
                } else {
                    setCanEdit(true);
                }
            } else if (isManager || isProcessing) {
                // Managers and processing agents can always edit
                setCanEdit(true);
            } else {
                // Any other role cannot edit
                setError("Vous n'avez pas les droits nécessaires pour modifier cette demande");
                setCanEdit(false);
            }
        } catch (error) {
            console.error("Error fetching request details:", error);
            setError("Échec du chargement des détails de la demande");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canEdit) {
            setError("Vous ne pouvez plus modifier cette demande");
            return;
        }

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
        if (!objet) {
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
            objet
        };

        try {
            console.log("Submitting edit request data:", requestData);

            const response = await RequestService.editRequest(id, requestData);
            console.log("Edit request response:", response);

            setSuccess("Demande modifiée avec succès");
            setSubmitted(false);

            // Navigate back to requests list after a brief delay
            setTimeout(() => {
                navigate("/requests");
            }, 2000);
        } catch (error) {
            console.error("Error editing request:", error);
            let errorMessage = "Échec de la modification de la demande. Veuillez réessayer.";

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

    if (initialLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Chargement des détails de la demande...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Modifier la Demande
            </Typography>

            {currentUser?.role === "ROLE_FRONTDESK" && canEdit && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Vous pouvez modifier cette demande car elle a été créée aujourd'hui
                </Alert>
            )}

            {(currentUser?.role === "ROLE_MANAGER" || currentUser?.role === "ROLE_PROCESSING") && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    En tant que {currentUser?.role === "ROLE_MANAGER" ? "manager" : "agent de traitement"}, vous pouvez modifier toutes les demandes à tout moment
                </Alert>
            )}

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

                {!canEdit ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Cette demande ne peut plus être modifiée car le délai de 15 minutes est dépassé.
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate("/requests")}
                            >
                                Retour à la liste
                            </Button>
                        </Box>
                    </Alert>
                ) : (
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
                                <TextField
                                    fullWidth
                                    label="Objet"
                                    value={objet}
                                    onChange={(e) => setObjet(e.target.value)}
                                    multiline
                                    rows={4}
                                    required
                                    error={submitted && !objet}
                                    helperText={submitted && !objet ? "L'objet de la demande est obligatoire" : ""}
                                    placeholder="Décrivez l'objet de la demande en détail"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    disabled={loading || !raisonSocialeNomsPrenom || !hasIdentifier() || !objet || !canEdit}
                                    sx={{ mr: 2 }}
                                >
                                    {loading ? "Modification en cours..." : "Enregistrer les Modifications"}
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/requests")}
                                >
                                    Annuler
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}

export default EditRequest; 