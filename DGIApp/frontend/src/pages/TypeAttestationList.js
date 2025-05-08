import React, { useState, useEffect } from "react";
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
    Snackbar
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
} from "@mui/icons-material";
import TypeAttestationService from "../services/type-attestation.service";

function TypeAttestationList() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    // Form state
    const [openForm, setOpenForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentType, setCurrentType] = useState({ id: null, label: "" });
    const [labelError, setLabelError] = useState("");

    // Delete confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);

    // Snackbar for notifications
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await TypeAttestationService.getAllTypes();
            setTypes(response);
        } catch (err) {
            console.error("Error fetching type attestations:", err);
            setError("Erreur lors de la récupération des types d'attestations");
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    // Form handlers
    const handleOpenForm = (type = null) => {
        if (type) {
            setCurrentType({ id: type.id, label: type.label });
            setEditMode(true);
        } else {
            setCurrentType({ id: null, label: "" });
            setEditMode(false);
        }
        setOpenForm(true);
        setLabelError("");
    };

    const handleCloseForm = () => {
        setOpenForm(false);
    };

    const handleInputChange = (e) => {
        const { value } = e.target;
        setCurrentType({ ...currentType, label: value });

        // Validation
        if (value.trim() === "") {
            setLabelError("Le label ne peut pas être vide");
        } else if (value.length < 3) {
            setLabelError("Le label doit contenir au moins 3 caractères");
        } else {
            setLabelError("");
        }
    };

    const handleSubmit = async () => {
        // Validate form
        if (currentType.label.trim() === "" || currentType.label.length < 3) {
            setLabelError("Le label doit contenir au moins 3 caractères");
            return;
        }

        try {
            setLoading(true);
            if (editMode) {
                // Update existing type
                await TypeAttestationService.updateType(currentType.id, { label: currentType.label });
                setSnackbar({
                    open: true,
                    message: "Type d'attestation mis à jour avec succès",
                    severity: "success"
                });
            } else {
                // Create new type
                await TypeAttestationService.createType({ label: currentType.label });
                setSnackbar({
                    open: true,
                    message: "Type d'attestation créé avec succès",
                    severity: "success"
                });
            }

            // Refresh data
            fetchTypes();
            handleCloseForm();
        } catch (err) {
            console.error("Error saving type attestation:", err);
            setSnackbar({
                open: true,
                message: "Erreur lors de l'enregistrement du type d'attestation",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete handlers
    const handleOpenDeleteDialog = (type) => {
        setTypeToDelete(type);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setTypeToDelete(null);
    };

    const handleDeleteType = async () => {
        if (!typeToDelete) return;

        try {
            setLoading(true);
            await TypeAttestationService.deleteType(typeToDelete.id);

            // Refresh data
            fetchTypes();
            setSnackbar({
                open: true,
                message: "Type d'attestation supprimé avec succès",
                severity: "success"
            });
        } catch (err) {
            console.error("Error deleting type attestation:", err);
            setSnackbar({
                open: true,
                message: "Erreur lors de la suppression du type d'attestation",
                severity: "error"
            });
        } finally {
            setLoading(false);
            handleCloseDeleteDialog();
        }
    };

    // Snackbar handler
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Filter types based on search
    const filteredTypes = types.filter(type =>
        type.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Paginate the filtered types
    const paginatedTypes = filteredTypes.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4">
                    Gestion des Types d'Attestation
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                >
                    Ajouter un Type
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Rechercher par label"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        sx={{ mr: 1 }}
                    />
                    <SearchIcon color="action" />
                </Box>
            </Paper>

            {loading && types.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : filteredTypes.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Aucun type d'attestation trouvé.
                </Alert>
            ) : (
                <>
                    <TableContainer component={Paper} elevation={2}>
                        <Table aria-label="types d'attestation table">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Label</TableCell>
                                    <TableCell>Date de création</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedTypes.map((type) => (
                                    <TableRow key={type.id} hover>
                                        <TableCell>{type.id}</TableCell>
                                        <TableCell>{type.label}</TableCell>
                                        <TableCell>
                                            {new Date(type.createdAt).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                                <Tooltip title="Modifier">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenForm(type)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Supprimer">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleOpenDeleteDialog(type)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredTypes.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Lignes par page:"
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
                    />
                </>
            )}

            {/* Add/Edit Type Form */}
            <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editMode ? "Modifier le Type d'Attestation" : "Ajouter un Type d'Attestation"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="label"
                        label="Label"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentType.label}
                        onChange={handleInputChange}
                        error={!!labelError}
                        helperText={labelError}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseForm} color="inherit">
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!!labelError || currentType.label.trim() === ""}
                    >
                        {editMode ? "Mettre à jour" : "Ajouter"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer le type d'attestation "{typeToDelete?.label}"?
                        Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="inherit">
                        Annuler
                    </Button>
                    <Button onClick={handleDeleteType} color="error" variant="contained">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default TypeAttestationList; 