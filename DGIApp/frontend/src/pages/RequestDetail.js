import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import RequestService from "../services/request.service";
import AuthService from "../services/auth.service";
import PrintIcon from '@mui/icons-material/Print';

function RequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
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
    const [cin, setCin] = useState("");
    const [ice, setIce] = useState("");
    const [canEdit, setCanEdit] = useState(false);
    const [timeLeftToEdit, setTimeLeftToEdit] = useState(0);

    // Add an additional field for the request raison sociale / nom
    const [raisonSocialeNomsPrenom, setRaisonSocialeNomsPrenom] = useState('');
    const [pmPp, setPmPp] = useState('');
    const [objet, setObjet] = useState('');

    // Check if we have an edit query parameter
    const shouldShowEditForm = new URLSearchParams(location.search).get('edit') === 'true';

    const [printingReceipt, setPrintingReceipt] = useState(false);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        fetchRequestDetails();
    }, [id]);

    useEffect(() => {
        // Check if the request can be edited (within 15 minutes of creation)
        if (request && request.createdAt && currentUser) {
            const createdAt = new Date(request.createdAt);
            const now = new Date();
            const diffMs = now - createdAt;
            const diffMins = Math.floor(diffMs / 60000);
            const timeLeft = 15 - diffMins;

            const isCreator = currentUser.id === request.creatorId;
            const isManager = currentUser.role === "ROLE_MANAGER";
            const isFrontdesk = currentUser.role === "ROLE_FRONTDESK";

            setTimeLeftToEdit(timeLeft > 0 ? timeLeft : 0);
            // Frontdesk can edit their own requests within time limit, managers can edit any request
            setCanEdit((timeLeft > 0 && isCreator && isFrontdesk) || isManager);

            // Log for debugging
            console.log("Edit rights check:", {
                isCreator,
                isFrontdesk,
                timeLeft,
                canEdit: (timeLeft > 0 && isCreator && isFrontdesk) || isManager
            });
        }
    }, [request, currentUser]);

    // Add an effect to automatically scroll to the edit form if edit=true
    useEffect(() => {
        if (shouldShowEditForm && canUpdateRequest() && !loading) {
            // Scroll to the edit form
            const editForm = document.getElementById('edit-request-form');
            if (editForm) {
                editForm.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [shouldShowEditForm, loading, currentUser]);

    const fetchRequestDetails = () => {
        setLoading(true);
        setError(null);

        RequestService.getRequestById(id)
            .then((response) => {
                const requestData = response.data;
                setRequest(requestData);

                // Set all form fields from request data
                if (requestData.dateTraitement) {
                    setDateTraitement(new Date(requestData.dateTraitement));
                }
                setEtat(requestData.etat || "NOUVEAU");
                setIfValue(requestData.ifValue || "");
                setSecteur(requestData.secteur || "");
                setMotifRejet(requestData.motifRejet || "");
                setTp(requestData.tp || "");
                setEmail(requestData.email || "");
                setGsm(requestData.gsm || "");
                setFix(requestData.fix || "");
                setRemarque(requestData.remarque || "");
                setCin(requestData.cin || "");
                setIce(requestData.ice || "");

                // Set additional editable fields
                setRaisonSocialeNomsPrenom(requestData.raisonSocialeNomsPrenom || "");
                setPmPp(requestData.pmPp || "PP");
                setObjet(requestData.objet || "");

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
        if (e) {
            e.preventDefault();
        }

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
            remarque,
            cin,
            ice,
            // Add the additional fields
            raisonSocialeNomsPrenom,
            pmPp,
            objet
        };

        console.log("Sending update request with data:", requestUpdateData);

        RequestService.updateRequest(id, requestUpdateData)
            .then((response) => {
                console.log("Update successful, response:", response);
                setSuccess("Demande mise à jour avec succès !");
                setRequest(response.data);
                setUpdatingRequest(false);

                // Instead of immediately navigating away, show the success message first
                setTimeout(() => {
                    navigate("/requests");
                }, 1000);
            })
            .catch((error) => {
                console.error("Error updating request:", error);
                setError(
                    error.response?.data?.message ||
                    "Échec de la mise à jour de la demande. Veuillez réessayer."
                );
                setUpdatingRequest(false);
            });
    };

    const canUpdateRequest = () => {
        return currentUser && (currentUser.role === "ROLE_PROCESSING" || currentUser.role === "ROLE_MANAGER");
    };

    // Add a new function to check if the current user is a frontdesk agent who can edit this request
    const isFrontdeskWithEditRights = () => {
        const result = currentUser &&
            currentUser.role === "ROLE_FRONTDESK" &&
            canEdit &&
            request &&
            currentUser.id === request.creatorId &&
            timeLeftToEdit > 0;

        // Log for debugging
        console.log("isFrontdeskWithEditRights result:", result, {
            currentUser: currentUser?.role,
            canEdit,
            creatorMatch: currentUser?.id === request?.creatorId,
            timeLeft: timeLeftToEdit
        });

        return result;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Function to handle printing the receipt
    const handlePrintReceipt = () => {
        if (!request || !request.id) return;

        setPrintingReceipt(true);
        RequestService.printReceipt(request.id)
            .then(() => {
                setSuccess("Reçu généré avec succès");
            })
            .catch(err => {
                console.error("Error printing receipt:", err);
                setError("Erreur lors de la génération du reçu: " + (err.message || "Erreur inconnue"));
            })
            .finally(() => {
                setPrintingReceipt(false);
            });
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
                {shouldShowEditForm ? "Modifier la Demande - ID: " : "Détails de la Demande - ID: "}{id}
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {request && (
                <Paper sx={{ p: 4, mb: 4 }}>
                    {/* Show the information table only when not in edit mode */}
                    {!shouldShowEditForm && (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Informations Complètes de la Demande
                                </Typography>
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

                            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                                <Table aria-label="detailed request information">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '25%' }}>
                                                ID
                                            </TableCell>
                                            <TableCell>{request.id}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Date d'Entrée
                                            </TableCell>
                                            <TableCell>{formatDate(request.dateEntree)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Nom/Entreprise
                                            </TableCell>
                                            <TableCell>{request.raisonSocialeNomsPrenom}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Type
                                            </TableCell>
                                            <TableCell>{request.pmPp === "PM" ? "Personne Morale" : "Personne Physique"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                CIN
                                            </TableCell>
                                            <TableCell>{request.cin || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                IF
                                            </TableCell>
                                            <TableCell>{request.ifValue || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                ICE
                                            </TableCell>
                                            <TableCell>{request.ice || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                TP
                                            </TableCell>
                                            <TableCell>{request.tp || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Secteur
                                            </TableCell>
                                            <TableCell>{request.secteur || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                GSM
                                            </TableCell>
                                            <TableCell>{request.gsm || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Téléphone Fixe
                                            </TableCell>
                                            <TableCell>{request.fix || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Email
                                            </TableCell>
                                            <TableCell>{request.email || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Objet
                                            </TableCell>
                                            <TableCell>{request.objet || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Remarque
                                            </TableCell>
                                            <TableCell>{request.remarque || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Statut
                                            </TableCell>
                                            <TableCell><strong>{request.etat || "NOUVEAU"}</strong></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Motif de Rejet
                                            </TableCell>
                                            <TableCell>{request.motifRejet || "N/A"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Date de Traitement
                                            </TableCell>
                                            <TableCell>{formatDate(request.dateTraitement) || "Pas encore traité"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Créé Le
                                            </TableCell>
                                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Mis à jour Le
                                            </TableCell>
                                            <TableCell>{formatDate(request.updatedAt)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Créé Par
                                            </TableCell>
                                            <TableCell>{request.creatorUsername || "N/A"} (ID: {request.creatorId})</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Traité Par
                                            </TableCell>
                                            <TableCell>{request.agentUsername || "Pas encore traité"} {request.agentId ? `(ID: ${request.agentId})` : ''}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Navigation button for view mode */}
                            <Box sx={{ mt: 3, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                {canEdit && (
                                    <>
                                        {timeLeftToEdit > 0 && currentUser?.role === "ROLE_FRONTDESK" && (
                                            <Alert severity="info" sx={{ mb: 2, width: "100%" }}>
                                                Il vous reste {timeLeftToEdit} minute{timeLeftToEdit !== 1 ? 's' : ''} pour modifier cette demande
                                            </Alert>
                                        )}

                                        {/* For processing/manager, navigate to edit within this page */}
                                        {canUpdateRequest() && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => navigate(`/requests/${id}?edit=true`)}
                                                sx={{ mb: 2, width: "220px" }}
                                            >
                                                Modifier la Demande
                                            </Button>
                                        )}

                                        {/* For frontdesk agents, navigate to edit-request page */}
                                        {isFrontdeskWithEditRights() && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => navigate(`/edit-request/${id}`)}
                                                sx={{ mb: 2, width: "220px" }}
                                            >
                                                Modifier la Demande (Frontdesk)
                                            </Button>
                                        )}
                                    </>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={() => navigate("/requests")}
                                    sx={{ width: "220px" }}
                                >
                                    Retour aux Demandes
                                </Button>
                            </Box>
                        </>
                    )}

                    {/* Show the edit form only when in edit mode and user has permission */}
                    {shouldShowEditForm && canUpdateRequest() && (
                        <>
                            <Typography variant="h6" gutterBottom id="edit-request-form">
                                Mettre à Jour la Demande
                            </Typography>

                            <Box component="form" onSubmit={handleUpdateRequest}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="ID"
                                            value={id}
                                            disabled
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Date d'Entrée"
                                            value={formatDate(request.dateEntree)}
                                            disabled
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Nom/Entreprise"
                                            value={raisonSocialeNomsPrenom}
                                            onChange={(e) => setRaisonSocialeNomsPrenom(e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Type</InputLabel>
                                            <Select
                                                value={pmPp}
                                                label="Type"
                                                onChange={(e) => setPmPp(e.target.value)}
                                            >
                                                <MenuItem value="PP">Personne Physique</MenuItem>
                                                <MenuItem value="PM">Personne Morale</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Objet"
                                            value={objet}
                                            onChange={(e) => setObjet(e.target.value)}
                                            required
                                        />
                                    </Grid>
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
                                                <MenuItem value="EN_TRAITEMENT">EN TRAITEMENT</MenuItem>
                                                <MenuItem value="TRAITE">TRAITÉ</MenuItem>
                                                <MenuItem value="REJETE">REJETÉ</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="CIN"
                                            value={cin || ""}
                                            onChange={(e) => setCin(e.target.value)}
                                            helperText="Carte d'identité nationale"
                                        />
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
                                            label="ICE"
                                            value={ice || ""}
                                            onChange={(e) => setIce(e.target.value)}
                                            helperText="Identifiant Commun de l'Entreprise"
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
                                            label="Secteur"
                                            value={secteur}
                                            onChange={(e) => setSecteur(e.target.value)}
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
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
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
                                </Grid>
                                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-start", gap: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={updatingRequest}
                                    >
                                        {updatingRequest ? "Mise à jour..." : "Mettre à Jour"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={() => navigate(`/requests/${id}`)}
                                    >
                                        Voir les Détails
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={() => navigate("/requests")}
                                    >
                                        Retour aux Demandes
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Show not authorized message if trying to edit without permission */}
                    {shouldShowEditForm && !canUpdateRequest() && (
                        <>
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                Vous n'êtes pas autorisé à modifier cette demande.
                            </Alert>
                            <Box sx={{ mt: 3, textAlign: "center" }}>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate(`/requests/${id}`)}
                                    sx={{ mr: 2 }}
                                >
                                    Voir les Détails
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/requests")}
                                >
                                    Retour aux Demandes
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            )}
        </Container>
    );
}

export default RequestDetail; 