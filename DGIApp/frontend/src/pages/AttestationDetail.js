import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Snackbar,
    IconButton,
    Tooltip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PrintIcon from '@mui/icons-material/Print';
import AttestationService from "../services/attestation.service";
import AuthService from "../services/auth.service";

function AttestationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attestation, setAttestation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [printingReceipt, setPrintingReceipt] = useState(false);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
        fetchAttestationDetails();
    }, [id]);

    const fetchAttestationDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AttestationService.getAttestationById(id);
            console.log("Attestation details:", response);
            setAttestation(response);
        } catch (err) {
            console.error("Error fetching attestation details:", err);
            setError("Erreur lors de la récupération des détails de l'attestation");
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'revenu_globale':
                return 'Attestation de Revenu Globale';
            case 'tva_logement_social':
                return 'Attestation d\'Assujettissement au TVA Logement Social';
            case 'renseignement_deces':
                return 'Attestation Renseignement Décès';
            case 'depart_definitif':
                return 'Attestation Départ Définitif';
            default:
                return type;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeliverAttestation = async () => {
        try {
            setLoading(true);
            const response = await AttestationService.markAttestationAsDelivered(id);
            setAttestation(response);
            setSnackbarMessage("Attestation marquée comme livrée avec succès");
            setSnackbarOpen(true);
        } catch (err) {
            console.error("Error delivering attestation:", err);
            setSnackbarMessage("Erreur lors de la livraison de l'attestation");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintReceipt = () => {
        if (!id) return;

        setPrintingReceipt(true);
        AttestationService.printReceipt(id)
            .then(() => {
                setSnackbarMessage("Reçu généré avec succès");
                setSnackbarOpen(true);
            })
            .catch(err => {
                console.error("Error printing receipt:", err);
                setSnackbarMessage("Erreur lors de la génération du reçu");
                setSnackbarOpen(true);
            })
            .finally(() => {
                setPrintingReceipt(false);
            });
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/attestation-list")}
                    sx={{ mt: 2 }}
                >
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    if (!attestation) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="info">Attestation non trouvée</Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/attestation-list")}
                    sx={{ mt: 2 }}
                >
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/attestation-list")}
                    sx={{ mr: 2 }}
                >
                    Retour
                </Button>
                <Typography variant="h4">
                    Détails de l'Attestation
                </Typography>

                <Box sx={{ ml: 'auto' }}>
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

            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h5">
                        {getTypeLabel(attestation.type)}
                    </Typography>
                    <Box>
                        <Chip
                            label={`ID: ${attestation.id}`}
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 1 }}
                        />
                        <Chip
                            label={attestation.status === "livré" ? "Livrée" : "Déposée"}
                            color={attestation.status === "livré" ? "success" : "default"}
                        />
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Numéro IF
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {attestation.ifValue || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            CIN
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {attestation.cin || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Nom
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {attestation.nom || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Prénom
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {attestation.prenom || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Email
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {attestation.email || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Téléphone
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {attestation.phone || "N/A"}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Créée par
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {attestation.creatorUsername || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Date de création
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {formatDate(attestation.createdAt)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Dernière mise à jour
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {formatDate(attestation.updatedAt)}
                        </Typography>
                    </Grid>
                </Grid>

                {attestation.status !== "livré" && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AssignmentTurnedInIcon />}
                            onClick={handleDeliverAttestation}
                        >
                            Marquer comme livrée
                        </Button>
                    </Box>
                )}
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
            />
        </Container>
    );
}

export default AttestationDetail; 