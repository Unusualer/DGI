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
    CircularProgress,
    IconButton,
    Tooltip
} from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import AttestationService from "../services/attestation.service";

function CreateAttestation() {
    const navigate = useNavigate();
    const [ifValue, setIfValue] = useState("");
    const [cin, setCin] = useState("");
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [attestationId, setAttestationId] = useState(null);
    const [printingReceipt, setPrintingReceipt] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Validate form
            if (!ifValue || !cin || !nom || !prenom || !type) {
                setError("Veuillez remplir tous les champs obligatoires");
                setLoading(false);
                return;
            }

            // Create attestation data object
            const attestationData = {
                ifValue,
                cin,
                nom,
                prenom,
                email,
                phone,
                type
            };

            console.log("Sending attestation data:", attestationData);

            // Call the service to create attestation
            const response = await AttestationService.createAttestation(attestationData);
            console.log("Attestation created successfully:", response);

            // Get the ID of the created attestation
            if (response && response.id) {
                setAttestationId(response.id);
            }

            // Set success message
            setSuccess("L'attestation a été créée avec succès");

            // Reset form
            setIfValue("");
            setCin("");
            setNom("");
            setPrenom("");
            setEmail("");
            setPhone("");
            setType("");

            // Navigate to attestation list after successful creation
            setTimeout(() => {
                navigate("/attestation-list");
            }, 3000);

        } catch (err) {
            console.error("Error creating attestation:", err);
            setError(err.response?.data?.message || "Une erreur s'est produite lors de la création de l'attestation");
        } finally {
            setLoading(false);
        }
    };

    const handlePrintReceipt = () => {
        if (!attestationId) return;

        setPrintingReceipt(true);
        AttestationService.printReceipt(attestationId)
            .then(() => {
                console.log("Receipt printed successfully");
            })
            .catch(err => {
                console.error("Error printing receipt:", err);
                setError("Erreur lors de la génération du reçu");
            })
            .finally(() => {
                setPrintingReceipt(false);
            });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Créer une Nouvelle Attestation
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
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
                                    disabled={printingReceipt || !attestationId}
                                >
                                    {printingReceipt ? <CircularProgress size={24} /> : <PrintIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Numéro IF"
                                value={ifValue}
                                onChange={(e) => setIfValue(e.target.value)}
                                margin="normal"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="CIN"
                                value={cin}
                                onChange={(e) => setCin(e.target.value)}
                                margin="normal"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Nom"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                margin="normal"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Prénom"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                margin="normal"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Téléphone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                margin="normal"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel id="type-label">Type d'Attestation</InputLabel>
                                <Select
                                    labelId="type-label"
                                    value={type}
                                    label="Type d'Attestation"
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <MenuItem value="revenu_globale">Attestation de Revenu Globale</MenuItem>
                                    <MenuItem value="tva_logement_social">Attestation d'Assujettissement au TVA Logement Social</MenuItem>
                                    <MenuItem value="renseignement_deces">Attestation Renseignement Décès</MenuItem>
                                    <MenuItem value="depart_definitif">Attestation Départ Définitif</MenuItem>
                                </Select>
                                {!type && <FormHelperText>Requis</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/attestation-list")}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : null}
                                >
                                    {loading ? "Création en cours..." : "Créer l'Attestation"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default CreateAttestation; 