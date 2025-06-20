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
    MenuItem,
    Grid,
    Stack,
    Snackbar,
    IconButton,
    Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearIcon from "@mui/icons-material/Clear";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import fr from 'date-fns/locale/fr';
import AttestationService from "../services/attestation.service";
import TypeAttestationService from "../services/type-attestation.service";
import AuthService from "../services/auth.service";

function AttestationList() {
    const navigate = useNavigate();
    const [attestations, setAttestations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tous");
    const [typeFilter, setTypeFilter] = useState("Tous");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [orderBy, setOrderBy] = useState(() => {
        const savedOrderBy = sessionStorage.getItem('attestationListOrderBy');
        return savedOrderBy || 'id';
    });
    const [order, setOrder] = useState(() => {
        const savedOrder = sessionStorage.getItem('attestationListOrder');
        return savedOrder || 'desc';
    });

    // Add state for attestation types
    const [attestationTypes, setAttestationTypes] = useState([]);
    const [typeLabelsMap, setTypeLabelsMap] = useState({});

    const [idSearchQuery, setIdSearchQuery] = useState("");

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
        fetchAttestations();
        fetchAttestationTypes();
    }, []);

    const fetchAttestationTypes = async () => {
        try {
            const types = await TypeAttestationService.getAllTypes();
            setAttestationTypes(types);

            // Create a map of type codes to labels
            const labelsMap = {};
            types.forEach(type => {
                const code = type.label
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '');
                labelsMap[code] = type.label;
            });

            // Add the predefined types
            labelsMap['revenu_globale'] = 'Revenu Globale';
            labelsMap['tva_logement_social'] = 'TVA Logement Social';
            labelsMap['renseignement_deces'] = 'Renseignement Décès';
            labelsMap['depart_definitif'] = 'Départ Définitif';

            setTypeLabelsMap(labelsMap);
        } catch (err) {
            console.error("Error fetching attestation types:", err);
        }
    };

    const fetchAttestations = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = AuthService.getCurrentUser();

            if (!user) {
                console.error("No user found, cannot fetch attestations");
                setError("Session non valide. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            console.log("Fetching all attestations via tracking endpoint");
            // Use the tracking endpoint for all authorized roles
            const response = await AttestationService.getAllAttestationsForTracking();

            console.log("Attestations fetched:", response);
            setAttestations(response);
        } catch (err) {
            console.error("Error fetching attestations:", err);
            setError("Erreur lors de la récupération des attestations");
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

    const handleViewAttestation = (id) => {
        navigate(`/attestation/${id}`);
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0);
    };

    const handleTypeFilterChange = (e) => {
        setTypeFilter(e.target.value);
        setPage(0);
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        setPage(0);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        setPage(0);
    };

    const handleCreateAttestation = () => {
        navigate('/create-attestation');
    };

    const clearFilters = () => {
        setSearchQuery("");
        setTypeFilter("Tous");
        setStatusFilter("Tous");
        setStartDate(null);
        setEndDate(null);
        setPage(0);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleAttestationSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        setOrder(newOrder);
        setOrderBy(property);
        sessionStorage.setItem('attestationListOrder', newOrder);
        sessionStorage.setItem('attestationListOrderBy', property);
    };

    const handleExportToExcel = () => {
        setExporting(true);
        setError(null);
        setSuccessMessage(null);

        // Create a new anchor element
        const link = document.createElement('a');
        link.href = '/api/attestations/exportExcel';
        link.setAttribute('download', 'Tableau des Attestations.xlsx');
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

    const getTypeLabel = (typeCode) => {
        // Check if we have the label in our map
        if (typeLabelsMap[typeCode]) {
            return typeLabelsMap[typeCode];
        }

        // Fallback to default handling for backward compatibility
        switch (typeCode) {
            case 'revenu_globale':
                return 'Revenu Globale';
            case 'tva_logement_social':
                return 'TVA Logement Social';
            case 'renseignement_deces':
                return 'Renseignement Décès';
            case 'depart_definitif':
                return 'Départ Définitif';
            default:
                return typeCode;
        }
    };

    const handleDeliverAttestation = async (id) => {
        try {
            setLoading(true);
            await AttestationService.markAttestationAsDelivered(id);

            // Update local state
            setAttestations(prevAttestations =>
                prevAttestations.map(attestation =>
                    attestation.id === id
                        ? { ...attestation, status: "livré" }
                        : attestation
                )
            );

            setSnackbarMessage("Attestation marquée comme livrée avec succès");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Erreur lors de la livraison de l'attestation:", error);
            setSnackbarMessage("Erreur lors de la livraison de l'attestation");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintReceipt = async (id) => {
        try {
            await AttestationService.printReceipt(id);
        } catch (error) {
            console.error("Erreur lors de l'impression du reçu:", error);
            setSnackbarMessage("Erreur lors de l'impression du reçu");
            setSnackbarOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // Filter and search logic
    const filteredAttestations = attestations.filter(attestation => {
        // ID search filter
        const matchesId = idSearchQuery === "" ||
            attestation.id.toString().includes(idSearchQuery);

        // Apply search query filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesCin = attestation.cin && attestation.cin.toLowerCase().includes(query);
            const matchesIf = attestation.ifValue && attestation.ifValue.toLowerCase().includes(query);
            if (!matchesCin && !matchesIf) return false;
        }

        // Apply status filter
        if (statusFilter !== "Tous" && attestation.status !== statusFilter) {
            return false;
        }

        // Apply type filter
        if (typeFilter !== "Tous" && attestation.type !== typeFilter) {
            return false;
        }

        // Apply date filters
        if (startDate) {
            const attestationDate = new Date(attestation.createdAt);
            startDate.setHours(0, 0, 0, 0);
            if (attestationDate < startDate) return false;
        }

        if (endDate) {
            const attestationDate = new Date(attestation.createdAt);
            endDate.setHours(23, 59, 59, 999);
            if (attestationDate > endDate) return false;
        }

        return matchesId &&
            (statusFilter === "Tous" || attestation.status === statusFilter) &&
            (typeFilter === "Tous" || attestation.type === typeFilter) &&
            (!startDate || new Date(attestation.createdAt) >= new Date(startDate.setHours(0, 0, 0, 0))) &&
            (!endDate || new Date(attestation.createdAt) <= new Date(endDate.setHours(23, 59, 59, 999)));
    });

    // Sort the filtered attestations
    const sortedAttestations = [...filteredAttestations].sort((a, b) => {
        // Define sorting logic for different fields
        switch (orderBy) {
            case 'id':
                return order === 'asc' ? a.id - b.id : b.id - a.id;

            case 'nom':
                const nomA = a.nom?.toLowerCase() || '';
                const nomB = b.nom?.toLowerCase() || '';
                return order === 'asc'
                    ? nomA.localeCompare(nomB)
                    : nomB.localeCompare(nomA);

            case 'prenom':
                const prenomA = a.prenom?.toLowerCase() || '';
                const prenomB = b.prenom?.toLowerCase() || '';
                return order === 'asc'
                    ? prenomA.localeCompare(prenomB)
                    : prenomB.localeCompare(prenomA);

            case 'cin':
                const cinA = a.cin?.toLowerCase() || '';
                const cinB = b.cin?.toLowerCase() || '';
                return order === 'asc'
                    ? cinA.localeCompare(cinB)
                    : cinB.localeCompare(cinA);

            case 'ifValue':
                const ifA = a.ifValue?.toLowerCase() || '';
                const ifB = b.ifValue?.toLowerCase() || '';
                return order === 'asc'
                    ? ifA.localeCompare(ifB)
                    : ifB.localeCompare(ifA);

            case 'type':
                return order === 'asc'
                    ? a.type?.localeCompare(b.type || '')
                    : b.type?.localeCompare(a.type || '');

            case 'status':
                return order === 'asc'
                    ? a.status?.localeCompare(b.status || '')
                    : b.status?.localeCompare(a.status || '');

            case 'createdAt':
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return order === 'asc' ? dateA - dateB : dateB - dateA;

            default:
                return 0;
        }
    });

    // Pagination logic
    const paginatedAttestations = sortedAttestations.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Render functions
    const renderStatusChip = (status) => {
        let color = "default";
        if (status === "déposé") {
            color = "primary";
        } else if (status === "livré") {
            color = "success";
        }
        return <Chip label={status} color={color} size="small" />;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4">
                    Liste des Attestations
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreateAttestation}
                    >
                        Nouvelle Attestation
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportToExcel}
                        disabled={exporting || attestations.length === 0}
                    >
                        {exporting ? "Exportation..." : "Exporter Excel"}
                    </Button>
                </Box>
            </Box>

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

            {/* Search and Basic Filters */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Recherche par CIN ou IF"
                                variant="outlined"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                sx={{ mr: 1 }}
                            />
                            <SearchIcon color="action" />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Recherche par ID"
                                variant="outlined"
                                value={idSearchQuery}
                                onChange={(e) => setIdSearchQuery(e.target.value)}
                                sx={{ mr: 1 }}
                            />
                            <SearchIcon color="action" />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="status-filter-label">Statut</InputLabel>
                            <Select
                                labelId="status-filter-label"
                                value={statusFilter}
                                label="Statut"
                                onChange={handleStatusFilterChange}
                            >
                                <MenuItem value="Tous">Tous</MenuItem>
                                <MenuItem value="déposé">Déposé</MenuItem>
                                <MenuItem value="livré">Livré</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={showFilters ? <ClearIcon /> : <FilterAltIcon />}
                                onClick={toggleFilters}
                                fullWidth
                            >
                                {showFilters ? "Masquer" : "Plus de filtres"}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Advanced Filters */}
                {showFilters && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel id="type-filter-label">Type d'attestation</InputLabel>
                                    <Select
                                        labelId="type-filter-label"
                                        value={typeFilter}
                                        label="Type d'attestation"
                                        onChange={handleTypeFilterChange}
                                    >
                                        <MenuItem value="Tous">Tous</MenuItem>
                                        {/* Static predefined types */}
                                        <MenuItem value="revenu_globale">Revenu Globale</MenuItem>
                                        <MenuItem value="tva_logement_social">TVA Logement Social</MenuItem>
                                        <MenuItem value="renseignement_deces">Renseignement Décès</MenuItem>
                                        <MenuItem value="depart_definitif">Départ Définitif</MenuItem>

                                        {/* Dynamic custom types from type_attestations table */}
                                        {attestationTypes.map((typeItem) => {
                                            const code = typeItem.label
                                                .toLowerCase()
                                                .replace(/\s+/g, '_')
                                                .replace(/[^a-z0-9_]/g, '');

                                            // Skip if it's one of the predefined types we've already added
                                            if (['revenu_globale', 'tva_logement_social', 'renseignement_deces', 'depart_definitif'].includes(code)) {
                                                return null;
                                            }

                                            return (
                                                <MenuItem key={typeItem.id} value={code}>
                                                    {typeItem.label}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                                    <DatePicker
                                        label="Date début"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                                    <DatePicker
                                        label="Date fin"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<ClearIcon />}
                                    onClick={clearFilters}
                                    fullWidth
                                >
                                    Effacer filtres
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>

            {/* Attestations Table */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : filteredAttestations.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Aucune attestation trouvée.
                </Alert>
            ) : (
                <>
                    <TableContainer component={Paper} elevation={2}>
                        <Table aria-label="attestations table">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableCell
                                        onClick={() => handleAttestationSort('id')}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            ID
                                            {orderBy === 'id' && (
                                                order === 'asc' ?
                                                    <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                                                    <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleAttestationSort('nom')}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Nom
                                            {orderBy === 'nom' && (
                                                order === 'asc' ?
                                                    <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                                                    <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleAttestationSort('prenom')}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Prénom
                                            {orderBy === 'prenom' && (
                                                order === 'asc' ?
                                                    <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                                                    <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleAttestationSort('cin')}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            CIN
                                            {orderBy === 'cin' && (
                                                order === 'asc' ?
                                                    <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                                                    <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleAttestationSort('ifValue')}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            IF
                                            {orderBy === 'ifValue' && (
                                                order === 'asc' ?
                                                    <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                                                    <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleAttestationSort('type')}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Type
                                            {orderBy === 'type' && (
                                                order === 'asc' ?
                                                    <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                                                    <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleAttestationSort('status')}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Statut
                                            {orderBy === 'status' && (
                                                order === 'asc' ?
                                                    <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                                                    <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleAttestationSort('createdAt')}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Date Création
                                            {orderBy === 'createdAt' && (
                                                order === 'asc' ?
                                                    <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                                                    <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedAttestations.map((attestation) => (
                                    <TableRow key={attestation.id} hover>
                                        <TableCell>{attestation.id}</TableCell>
                                        <TableCell>{attestation.nom}</TableCell>
                                        <TableCell>{attestation.prenom}</TableCell>
                                        <TableCell>{attestation.cin || "N/A"}</TableCell>
                                        <TableCell>{attestation.ifValue || "N/A"}</TableCell>
                                        <TableCell>{getTypeLabel(attestation.type)}</TableCell>
                                        <TableCell>{renderStatusChip(attestation.status)}</TableCell>
                                        <TableCell>
                                            {new Date(attestation.createdAt).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                                <Tooltip title="Voir détails">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleViewAttestation(attestation.id)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Imprimer reçu">
                                                    <IconButton
                                                        size="small"
                                                        color="secondary"
                                                        onClick={() => handlePrintReceipt(attestation.id)}
                                                    >
                                                        <PrintIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                {attestation.status !== "livré" && (
                                                    <Tooltip title="Marquer comme livré">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleDeliverAttestation(attestation.id)}
                                                        >
                                                            <AssignmentTurnedInIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={filteredAttestations.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Lignes par page:"
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
                        sx={{
                            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                margin: 0
                            },
                            '.MuiTablePagination-toolbar': {
                                minHeight: '52px',
                                display: 'flex',
                                alignItems: 'center'
                            }
                        }}
                    />
                </>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
            />
        </Container>
    );
}

export default AttestationList; 