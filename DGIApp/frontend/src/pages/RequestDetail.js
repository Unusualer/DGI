import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import RequestService from "../services/request.service";
import AuthService from "../services/auth.service";

function RequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Form fields for processing agents
    const [dateTraitement, setDateTraitement] = useState(new Date());
    const [etat, setEtat] = useState("EN_TRAITEMENT");
    const [ifValue, setIfValue] = useState("");
    const [secteur, setSecteur] = useState("");
    const [motifRejet, setMotifRejet] = useState("");
    const [tp, setTp] = useState("");
    const [email, setEmail] = useState("");
    const [gsm, setGsm] = useState("");
    const [fix, setFix] = useState("");
    const [remarque, setRemarque] = useState("");
    const [updatingRequest, setUpdatingRequest] = useState(false);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        fetchRequestDetails();
    }, [id]);

    const fetchRequestDetails = () => {
        setLoading(true);
        RequestService.getRequestById(id)
            .then((response) => {
                setRequest(response.data);

                // Pre-fill form fields if data exists
                if (response.data.dateTraitement) {
                    setDateTraitement(new Date(response.data.dateTraitement));
                }
                if (response.data.etat) {
                    setEtat(response.data.etat);
                }
                setIfValue(response.data.ifValue || "");
                setSecteur(response.data.secteur || "");
                setMotifRejet(response.data.motifRejet || "");
                setTp(response.data.tp || "");
                setEmail(response.data.email || "");
                setGsm(response.data.gsm || "");
                setFix(response.data.fix || "");
                setRemarque(response.data.remarque || "");

                setError(null);
            })
            .catch((error) => {
                console.error("Error fetching request details:", error);
                setError("Échec du chargement des détails de la demande. Veuillez réessayer.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleUpdateRequest = (e) => {
        e.preventDefault();
        setUpdatingRequest(true);
        setError(null);
        setSuccess(null);

        // Format the date to ISO string (YYYY-MM-DD)
        const formattedDateTraitement = dateTraitement.toISOString().split('T')[0];

        const requestUpdateData = {
            dateTraitement: formattedDateTraitement,
            etat,
            ifValue,
            secteur,
            motifRejet,
            tp,
            email,
            gsm,
            fix,
            remarque
        };

        RequestService.updateRequest(id, requestUpdateData)
            .then((response) => {
                setSuccess("Demande mise à jour avec succès !");
                setRequest(response.data);
                setUpdatingRequest(false);

                // Update the navigate target from track-request to requests
                navigate("/requests");
            })
            .catch((error) => {
                console.error("Error updating request:", error);
                setError(
                    error.response?.data?.message ||
                    "Échec de la mise à jour de la demande. Veuillez réessayer."
                );
            });
    };

    const canUpdateRequest = () => {
        return currentUser && (currentUser.role === "ROLE_PROCESSING" || currentUser.role === "ROLE_MANAGER");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Chargement des détails de la demande...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Button variant="contained" onClick={() => navigate("/requests")}>
                        Retour aux Demandes
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Détails de la Demande - ID: {id}
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {request && (
                <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Informations de Base
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Date d'Entrée
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(request.dateEntree)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Type
                            </Typography>
                            <Typography variant="body1">
                                {request.pmPp === "PM" ? "Personne Morale" : "Personne Physique"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Identifiant
                            </Typography>
                            <Typography variant="body1">
                                {request.cin && <span>CIN: {request.cin}</span>}
                                {!request.cin && request.ifValue && <span>IF: {request.ifValue}</span>}
                                {!request.cin && !request.ifValue && <span>N/A</span>}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Statut
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {request.etat || "NOUVEAU"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Nom/Entreprise
                            </Typography>
                            <Typography variant="body1">
                                {request.raisonSocialeNomsPrenom}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Objet
                            </Typography>
                            <Typography variant="body1">
                                {request.objet || "N/A"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Créé Par
                            </Typography>
                            <Typography variant="body1">
                                {request.creatorUsername || "N/A"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Traité Par
                            </Typography>
                            <Typography variant="body1">
                                {request.agentUsername || "Pas encore traité"}
                            </Typography>
                        </Grid>
                    </Grid>

                    {canUpdateRequest() && (
                        <>
                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom>
                                Mettre à Jour la Demande
                            </Typography>

                            <Box component="form" onSubmit={handleUpdateRequest}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label="Date de Traitement"
                                                value={dateTraitement}
                                                onChange={(newDate) => setDateTraitement(newDate)}
                                                slotProps={{
                                                    textField: { fullWidth: true, required: true },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Statut</InputLabel>
                                            <Select
                                                value={etat}
                                                label="Statut"
                                                onChange={(e) => setEtat(e.target.value)}
                                            >
                                                <MenuItem value="NOUVEAU">NOUVEAU</MenuItem>
                                                <MenuItem value="EN_TRAITEMENT">EN TRAITEMENT</MenuItem>
                                                <MenuItem value="TRAITE">TRAITÉ</MenuItem>
                                                <MenuItem value="REJETE">REJETÉ</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="IF"
                                            value={ifValue}
                                            onChange={(e) => setIfValue(e.target.value)}
                                            helperText="Numéro d'identification fiscale (IF)"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Secteur"
                                            value={secteur}
                                            onChange={(e) => setSecteur(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Motif de Rejet"
                                            value={motifRejet}
                                            onChange={(e) => setMotifRejet(e.target.value)}
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="TP"
                                            value={tp}
                                            onChange={(e) => setTp(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="GSM"
                                            value={gsm}
                                            onChange={(e) => setGsm(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Téléphone Fixe"
                                            value={fix}
                                            onChange={(e) => setFix(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Remarques"
                                            value={remarque}
                                            onChange={(e) => setRemarque(e.target.value)}
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={updatingRequest}
                                        >
                                            {updatingRequest ? "Mise à jour..." : "Mettre à Jour"}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            sx={{ mr: 2 }}
                                            onClick={() => navigate("/requests")}
                                        >
                                            Retour aux Demandes
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </>
                    )}

                    {!canUpdateRequest() && (
                        <Box sx={{ mt: 3, textAlign: "center" }}>
                            <Button variant="contained" onClick={() => navigate("/requests")}>
                                Retour aux Demandes
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}
        </Container>
    );
}

export default RequestDetail; 