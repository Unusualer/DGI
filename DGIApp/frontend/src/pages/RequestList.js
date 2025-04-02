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
    const [statusFilter, setStatusFilter] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

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
            let response;

            // Fetch appropriate requests based on user role
            if (currentUser?.role === "ROLE_MANAGER") {
                response = await RequestService.getAllRequests();
            } else if (currentUser?.role === "ROLE_FRONTDESK") {
                response = await RequestService.getMySubmissions();
            } else if (currentUser?.role === "ROLE_PROCESSING") {
                response = await RequestService.getMyProcessedRequests();
            } else {
                // Fallback to tracking endpoint which is accessible to all roles
                response = await RequestService.getAllRequestsForTracking();
            }

            setRequests(response.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
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

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(0);
    };

    // Filter requests based on search query and status filter
    const filteredRequests = requests.filter((request) => {
        const matchesSearch = searchQuery === "" ||
            (request.raisonSocialeNomsPrenom &&
                request.raisonSocialeNomsPrenom.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (request.cin && request.cin.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (request.ifValue && request.ifValue.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === "" || request.etat === statusFilter;

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
            case "COMPLETE":
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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Liste des Demandes
            </Typography>

            <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <TextField
                    label="Rechercher par nom ou identifiant"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearch}
                    size="small"
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />,
                    }}
                    sx={{ flexGrow: 1, minWidth: "200px" }}
                />

                <FormControl sx={{ minWidth: "200px" }} size="small">
                    <InputLabel id="status-filter-label">Statut</InputLabel>
                    <Select
                        labelId="status-filter-label"
                        value={statusFilter}
                        label="Statut"
                        onChange={handleStatusFilterChange}
                    >
                        <MenuItem value="">Tous</MenuItem>
                        <MenuItem value="NOUVEAU">Nouveau</MenuItem>
                        <MenuItem value="EN_TRAITEMENT">En Traitement</MenuItem>
                        <MenuItem value="COMPLETE">Complété</MenuItem>
                        <MenuItem value="REJETE">Rejeté</MenuItem>
                    </Select>
                </FormControl>

                <Button variant="contained" onClick={fetchRequests}>
                    Actualiser
                </Button>
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
                                            {!request.cin && !request.ifValue && "—"}
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
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewRequest(request.id)}
                                            >
                                                Voir
                                            </Button>
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
                        Aucune demande trouvée.
                    </Typography>
                    {searchQuery || statusFilter ? (
                        <Button
                            variant="text"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("");
                            }}
                        >
                            Effacer les filtres
                        </Button>
                    ) : (
                        currentUser?.role === "ROLE_FRONTDESK" || currentUser?.role === "ROLE_MANAGER" ? (
                            <Button
                                variant="contained"
                                onClick={() => navigate("/create-request")}
                                sx={{ mt: 2 }}
                            >
                                Créer une Nouvelle Demande
                            </Button>
                        ) : null
                    )}
                </Paper>
            )}
        </Container>
    );
}

export default RequestList; 