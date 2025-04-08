import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    TextField,
    Box,
    CircularProgress,
    Alert,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RequestService from "../services/request.service";
import AuthService from "../services/auth.service";

function RequestList() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tous");
    const [currentUser, setCurrentUser] = useState(null);
    const [processingRequests, setProcessingRequests] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        // Get current user
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);

        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get current user directly instead of using state
            // This ensures we always have the latest user data when refreshing
            const user = AuthService.getCurrentUser();

            console.log("Current user for request fetching:", user);

            if (!user) {
                console.error("No user found, cannot fetch requests");
                setError("Session non valide. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            // For all user roles, always fetch all requests using the tracking endpoint
            console.log("Fetching all requests via tracking endpoint");
            const response = await RequestService.getAllRequestsForTracking();

            console.log("Request response received:", response);
            if (response && response.data) {
                console.log("Number of requests fetched:", response.data.length);
                setRequests(response.data);
            } else {
                console.error("Response received but no data property");
                setRequests([]);
            }
        } catch (err) {
            console.error("Error fetching requests:", err);
            console.error("Error details:", JSON.stringify(err, null, 2));
            setError("Échec du chargement des demandes. Veuillez réessayer plus tard.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewRequest = (id) => {
        navigate(`/requests/${id}`);
    };

    const handleEditRequest = (id) => {
        navigate(`/requests/${id}?edit=true`);
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(0);
    };

    const handleProcessTodayRequests = () => {
        setProcessingRequests(true);
        setSuccessMessage(null);
        setError(null);

        RequestService.bulkUpdateTodayRequests()
            .then(response => {
                setSuccessMessage(`${response.data.updatedCount} demandes ont été mises à jour avec succès.`);
                fetchRequests(); // Reload the requests to show updated statuses
            })
            .catch(err => {
                console.error("Error processing today's requests:", err);
                setError(err.response?.data?.message || "Échec de la mise à jour des demandes. Veuillez réessayer.");
            })
            .finally(() => {
                setProcessingRequests(false);
            });
    };

    const handleExportToExcel = () => {
        setExporting(true);
        setError(null);

        // Create a new anchor element
        const link = document.createElement('a');
        link.href = 'http://localhost:8080/api/requests/exportExcel';
        link.setAttribute('download', 'requests.xlsx');
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Set success message and reset state
        setSuccessMessage("Téléchargement démarré. Si le fichier ne se télécharge pas automatiquement, vérifiez les paramètres de votre navigateur.");
        setTimeout(() => {
            setExporting(false);
            setTimeout(() => setSuccessMessage(null), 5000);
        }, 1000);
    };

    // Filter requests based on search query and status filter
    const filteredRequests = requests.filter((request) => {
        const matchesSearch = searchQuery === "" ||
            (request.raisonSocialeNomsPrenom &&
                request.raisonSocialeNomsPrenom.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (request.cin && request.cin.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (request.ifValue && request.ifValue.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (request.ice && request.ice.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === "Tous" || request.etat === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Get requests for current page
    const displayedRequests = filteredRequests
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Status chip color mapping
    const getStatusChipColor = (status) => {
        switch (status) {
            case "NOUVEAU":
                return "info";
            case "EN_TRAITEMENT":
                return "warning";
            case "TRAITE":
                return "success";
            case "REJETE":
                return "error";
            default:
                return "default";
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Chargement des demandes...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Button variant="contained" onClick={fetchRequests}>
                        Réessayer
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Liste des Demandes
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            <Box sx={{ display: "flex", mb: 3, flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, maxWidth: 500 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Recherche par CIN ou IF ou ICE"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ mr: 1 }}
                    />
                    <SearchIcon color="action" />
                </Box>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="status-filter-label">Filtrer par Statut</InputLabel>
                    <Select
                        labelId="status-filter-label"
                        size="small"
                        value={statusFilter}
                        label="Filtrer par Statut"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="Tous">Tous</MenuItem>
                        <MenuItem value="NOUVEAU">Nouveau</MenuItem>
                        <MenuItem value="EN_TRAITEMENT">En Traitement</MenuItem>
                        <MenuItem value="TRAITE">Traité</MenuItem>
                        <MenuItem value="REJETE">Rejeté</MenuItem>
                    </Select>
                </FormControl>

                {(currentUser?.role === "ROLE_FRONTDESK" || currentUser?.role === "ROLE_MANAGER") && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/create-request")}
                    >
                        Nouvelle Demande
                    </Button>
                )}

                {currentUser?.role === "ROLE_FRONTDESK" && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleProcessTodayRequests}
                        disabled={processingRequests}
                    >
                        {processingRequests ? 'Traitement...' : 'Traiter les demandes du jour'}
                    </Button>
                )}

                {currentUser?.role === "ROLE_MANAGER" && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportToExcel}
                        disabled={exporting || loading}
                    >
                        {exporting ? 'Exportation...' : 'Exporter Excel'}
                    </Button>
                )}
            </Box>

            {filteredRequests.length > 0 ? (
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
                        <Table stickyHeader aria-label="requests table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Date de Soumission</TableCell>
                                    <TableCell>Nom/Entreprise</TableCell>
                                    <TableCell>Identifiant</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Objet</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedRequests.map((request) => (
                                    <TableRow hover key={request.id}>
                                        <TableCell>{request.id}</TableCell>
                                        <TableCell>{request.dateEntree}</TableCell>
                                        <TableCell>{request.raisonSocialeNomsPrenom}</TableCell>
                                        <TableCell>
                                            {request.cin && `CIN: ${request.cin}`}
                                            {!request.cin && request.ifValue && `IF: ${request.ifValue}`}
                                            {!request.cin && !request.ifValue && request.ice && `ICE: ${request.ice}`}
                                            {!request.cin && !request.ifValue && !request.ice && "—"}
                                        </TableCell>
                                        <TableCell>{request.pmPp}</TableCell>
                                        <TableCell>{request.objet}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={request.etat}
                                                color={getStatusChipColor(request.etat)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {(currentUser?.role === "ROLE_MANAGER" || currentUser?.role === "ROLE_PROCESSING") ? (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleEditRequest(request.id)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Modifier
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleViewRequest(request.id)}
                                                    >
                                                        Voir
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleViewRequest(request.id)}
                                                >
                                                    Voir
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={filteredRequests.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            ) : (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                        {currentUser?.role === "ROLE_PROCESSING"
                            ? "Aucune demande n'a été assignée à votre compte pour traitement."
                            : currentUser?.role === "ROLE_FRONTDESK"
                                ? "Vous n'avez pas encore créé de demandes."
                                : "Aucune demande trouvée."}
                    </Typography>
                    {searchQuery || statusFilter ? (
                        <Button
                            variant="text"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("Tous");
                            }}
                        >
                            Effacer les filtres
                        </Button>
                    ) : (
                        <>
                            {(currentUser?.role === "ROLE_FRONTDESK" || currentUser?.role === "ROLE_MANAGER") && (
                                <Button
                                    variant="contained"
                                    onClick={() => navigate("/create-request")}
                                    sx={{ mt: 2, mr: 2 }}
                                >
                                    Créer une Nouvelle Demande
                                </Button>
                            )}
                        </>
                    )}
                </Paper>
            )}
        </Container>
    );
}

export default RequestList; 