import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    TableContainer,
    Chip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import axios from "axios";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [fetchMethod, setFetchMethod] = useState('standard'); // 'standard', 'test', 'mock'
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("Tous");
    const [successMessage, setSuccessMessage] = useState(null);
    // Add sorting state
    const [orderBy, setOrderBy] = useState('id');
    const [order, setOrder] = useState('asc');

    // CRUD State
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'delete', 'reassign-delete'
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'frontdesk'
    });
    const [formErrors, setFormErrors] = useState({});
    // New state for reassignment
    const [reassignToUserId, setReassignToUserId] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            console.log("Current user in UserManagement:", user.username, "with role:", user.role);
            setCurrentUser(user);
            fetchUsers();
        } else {
            console.error("No user found in localStorage");
            setLoading(false);
            setError("Vous devez être connecté pour accéder à cette page.");
        }
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        console.log("Récupération des utilisateurs...");

        // Vérifier que l'utilisateur est connecté en tant qu'admin
        const user = AuthService.getCurrentUser();
        if (!user) {
            setError("Vous devez être connecté pour accéder à cette page.");
            setLoading(false);
            return;
        }

        if (user.role !== "ROLE_ADMIN") {
            setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page.");
            setLoading(false);
            return;
        }

        console.log("Utilisateur actuel:", user.username, "avec le rôle:", user.role);

        // Utiliser le service utilisateur avec l'en-tête d'authentification explicite
        UserService.getAllUsers()
            .then((response) => {
                console.log("Utilisateurs récupérés avec succès:", response.data);
                setUsers(response.data);
                setFetchMethod('standard');
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des utilisateurs:", error);

                // Afficher des détails spécifiques sur l'erreur
                if (error.response) {
                    console.error("Détails de la réponse d'erreur:", error.response.data);
                    console.error("Statut:", error.response.status);

                    if (error.response.status === 401) {
                        setError("Erreur d'authentification. Votre session a peut-être expiré. Veuillez vous reconnecter.");
                    } else {
                        setError(`Impossible de charger les utilisateurs: ${error.response.data?.message || error.response.statusText}`);
                    }
                } else if (error.request) {
                    console.error("Aucune réponse reçue:", error.request);
                    setError("Aucune réponse du serveur. Vérifiez votre connexion réseau.");
                } else {
                    console.error("Erreur:", error.message);
                    setError(`Erreur: ${error.message}`);
                }

                // Ajouter automatiquement un délai avant d'essayer la méthode de secours
                setTimeout(() => {
                    console.log("Tentative avec la méthode de secours...");
                    fallbackFetch();
                }, 1000);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Fonction de secours pour récupérer les utilisateurs
    const fallbackFetch = () => {
        console.log("Utilisation de la méthode de secours pour récupérer les utilisateurs");
        setLoading(true);

        // Essayer l'endpoint de test
        UserService.getUsersTest()
            .then(response => {
                console.log("Utilisateurs récupérés via l'API de test:", response.data);
                setUsers(response.data);
                setFetchMethod('test');
                setError(null);
            })
            .catch(testError => {
                console.error("Échec de l'API de test:", testError);

                // Si tout échoue, utiliser des données simulées
                console.log("Utilisation de données simulées comme dernier recours");
                const mockUsers = [
                    { id: 1, username: "admin", email: "admin@example.com", role: "ROLE_ADMIN" },
                    { id: 2, username: "manager", email: "manager@example.com", role: "ROLE_MANAGER" },
                    { id: 3, username: "frontdesk", email: "frontdesk@example.com", role: "ROLE_FRONTDESK" },
                    { id: 4, username: "processing", email: "processing@example.com", role: "ROLE_PROCESSING" }
                ];
                setUsers(mockUsers);
                setFetchMethod('mock');
                setSuccessMessage("Données simulées affichées");
                setError("Les données affichées sont simulées. La connexion au serveur a échoué.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Handle opening dialogs for CRUD operations
    const handleOpenDialog = (type, user = null) => {
        setDialogType(type);
        setFormErrors({});

        if (type === 'add') {
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'frontdesk'
            });
        } else if (type === 'edit' && user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '', // Don't prefill password
                role: user.role ? user.role.replace('ROLE_', '').toLowerCase() : 'frontdesk'
            });
        } else if (type === 'delete' && user) {
            setEditingUser(user);
        } else if (type === 'reassign-delete' && user) {
            setEditingUser(user);
            // Get list of available users for reassignment
            // Filter out the current user being deleted
            const otherUsers = users.filter(u => u.id !== user.id);
            setAvailableUsers(otherUsers);
            // Set default value if there are available users
            if (otherUsers.length > 0) {
                setReassignToUserId(otherUsers[0].id);
            } else {
                setReassignToUserId('');
            }
        }

        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when field is changed
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleRoleFilterChange = (event) => {
        setRoleFilter(event.target.value);
        setPage(0);
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.username) errors.username = 'Le nom d\'utilisateur est obligatoire';
        if (!formData.email) errors.email = 'L\'email est obligatoire';
        if (dialogType === 'add' && !formData.password) errors.password = 'Le mot de passe est obligatoire';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (dialogType !== 'delete' && dialogType !== 'reassign-delete' && !validateForm()) return;

        setLoading(true);
        setError(null);
        console.log(`Action demandée: ${dialogType}`);

        if (dialogType === 'add') {
            // Création d'un nouvel utilisateur
            UserService.createUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role
            })
                .then(response => {
                    setSuccessMessage(`Utilisateur ${formData.username} créé avec succès.`);
                    handleCloseDialog();
                    fetchUsers();
                })
                .catch(error => {
                    setError(`Échec de la création de l'utilisateur: ${error.response?.data?.message || error.message}`);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (dialogType === 'edit' && editingUser) {
            // Modification d'un utilisateur existant
            const updateData = {
                username: formData.username,
                email: formData.email,
                role: formData.role
            };

            // N'inclure le mot de passe que s'il a été modifié
            if (formData.password) {
                updateData.password = formData.password;
            }

            UserService.updateUser(editingUser.id, updateData)
                .then(response => {
                    setSuccessMessage(`Utilisateur ${formData.username} mis à jour avec succès.`);
                    handleCloseDialog();
                    fetchUsers();
                })
                .catch(error => {
                    setError(`Échec de la mise à jour de l'utilisateur: ${error.response?.data?.message || error.message}`);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (dialogType === 'delete' && editingUser) {
            // Suppression d'un utilisateur
            console.log("UI: Début de la suppression pour l'utilisateur ID:", editingUser.id, "Nom:", editingUser.username);

            // Appliquer un timeout de sécurité pour s'assurer que le loading est désactivé
            const securityTimeout = setTimeout(() => {
                console.log("UI: Timeout de sécurité atteint");
                setLoading(false);
            }, 15000);

            UserService.deleteUser(editingUser.id)
                .then(response => {
                    clearTimeout(securityTimeout);
                    console.log("UI: Suppression réussie, réponse:", response.status);
                    setSuccessMessage(`Utilisateur ${editingUser.username} supprimé avec succès.`);
                    handleCloseDialog();
                    // Forcer un refresh de la liste des utilisateurs
                    fetchUsers();
                })
                .catch(error => {
                    // Check if this is a foreign key constraint error
                    const errorMsg = error.response?.data?.message || '';
                    if (errorMsg.includes('violates foreign key constraint') ||
                        errorMsg.includes('assigned to') ||
                        errorMsg.includes('have created')) {
                        console.log("UI: Erreur de contrainte de clé étrangère détectée. Proposition de réassignation.");
                        // Close the current dialog and open the reassign-delete dialog
                        handleCloseDialog();
                        handleOpenDialog('reassign-delete', editingUser);
                    } else {
                        clearTimeout(securityTimeout);
                        console.error("UI: Erreur de suppression:", error);

                        let errorMessage = "Erreur lors de la suppression de l'utilisateur";
                        if (error.response) {
                            errorMessage += `: ${error.response.data?.message || error.response.statusText || error.message}`;
                        } else {
                            errorMessage += `: ${error.message}`;
                        }

                        setError(errorMessage);
                    }
                })
                .finally(() => {
                    clearTimeout(securityTimeout);
                    console.log("UI: Opération de suppression terminée");
                    setLoading(false);
                });
        } else if (dialogType === 'reassign-delete' && editingUser && reassignToUserId) {
            // Handle reassign and delete action
            console.log("UI: Début de la réassignation et suppression pour l'utilisateur ID:",
                editingUser.id, "Nom:", editingUser.username,
                "Réassigner vers l'utilisateur ID:", reassignToUserId);

            // Appliquer un timeout de sécurité pour s'assurer que le loading est désactivé
            const securityTimeout = setTimeout(() => {
                console.log("UI: Timeout de sécurité atteint");
                setLoading(false);
            }, 25000);

            UserService.reassignAndDeleteUser(editingUser.id, reassignToUserId)
                .then(response => {
                    clearTimeout(securityTimeout);
                    console.log("UI: Réassignation et suppression réussies, réponse:", response.status);
                    setSuccessMessage(`Utilisateur ${editingUser.username} supprimé avec succès et demandes réassignées.`);
                    handleCloseDialog();
                    // Forcer un refresh de la liste des utilisateurs
                    fetchUsers();
                })
                .catch(error => {
                    clearTimeout(securityTimeout);
                    console.error("UI: Erreur de réassignation et suppression:", error);

                    let errorMessage = "Erreur lors de la réassignation et suppression de l'utilisateur";
                    if (error.response) {
                        errorMessage += `: ${error.response.data?.message || error.response.statusText || error.message}`;
                    } else {
                        errorMessage += `: ${error.message}`;
                    }

                    setError(errorMessage);
                })
                .finally(() => {
                    clearTimeout(securityTimeout);
                    console.log("UI: Opération de réassignation et suppression terminée");
                    setLoading(false);
                });
        }
    };

    // Add sorting handler
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Add sorting function
    const sortUsers = (users) => {
        return users.sort((a, b) => {
            const isAsc = order === 'asc';
            let comparison = 0;

            switch (orderBy) {
                case 'id':
                    comparison = a.id - b.id;
                    break;
                case 'username':
                    comparison = a.username.localeCompare(b.username);
                    break;
                case 'email':
                    comparison = a.email.localeCompare(b.email);
                    break;
                case 'role':
                    comparison = a.role.localeCompare(b.role);
                    break;
                default:
                    comparison = 0;
            }

            return isAsc ? comparison : -comparison;
        });
    };

    // Update filteredUsers to include sorting
    const filteredUsers = sortUsers(users.filter((user) => {
        const matchesSearch = searchQuery === "" ||
            (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole = roleFilter === "Tous" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    }));

    // Get users for current page
    const displayedUsers = filteredUsers
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Role chip color mapping
    const getRoleChipColor = (role) => {
        switch (role) {
            case "ROLE_ADMIN":
                return "error";
            case "ROLE_MANAGER":
                return "success";
            case "ROLE_PROCESSING":
                return "warning";
            case "ROLE_FRONTDESK":
                return "info";
            default:
                return "default";
        }
    };

    // Dialog content based on type
    const renderDialogContent = () => {
        if (dialogType === 'delete') {
            return (
                <>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer l'utilisateur "{editingUser?.username}" ? Cette action ne peut pas être annulée.
                    </DialogContentText>
                </>
            );
        } else if (dialogType === 'reassign-delete') {
            return (
                <>
                    <DialogContentText>
                        L'utilisateur "{editingUser?.username}" a des demandes associées et ne peut pas être supprimé directement.
                        Veuillez choisir un utilisateur à qui réassigner toutes les demandes avant la suppression.
                    </DialogContentText>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="reassign-user-label">Réassigner à</InputLabel>
                        <Select
                            labelId="reassign-user-label"
                            id="reassign-user"
                            value={reassignToUserId}
                            label="Réassigner à"
                            onChange={(e) => setReassignToUserId(e.target.value)}
                        >
                            {availableUsers.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.username} ({user.role?.replace("ROLE_", "")})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </>
            );
        }

        return (
            <>
                <TextField
                    autoFocus
                    margin="dense"
                    id="username"
                    name="username"
                    label="Nom d'utilisateur"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formData.username}
                    onChange={handleInputChange}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
                />
                <TextField
                    margin="dense"
                    id="email"
                    name="email"
                    label="Adresse Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                />
                <TextField
                    margin="dense"
                    id="password"
                    name="password"
                    label={dialogType === 'edit' ? "Mot de passe" : "Mot de passe"}
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel id="role-label">Rôle</InputLabel>
                    <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={formData.role}
                        label="Rôle"
                        onChange={handleInputChange}
                    >
                        <MenuItem value="admin">Administrateur</MenuItem>
                        <MenuItem value="manager">Gestionnaire</MenuItem>
                        <MenuItem value="processing">Traitement</MenuItem>
                        <MenuItem value="frontdesk">Accueil</MenuItem>
                    </Select>
                </FormControl>
            </>
        );
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Chargement des utilisateurs...
                </Typography>
            </Container>
        );
    }

    if (currentUser && currentUser.role !== "ROLE_ADMIN") {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Vous n'avez pas l'autorisation d'accéder à cette page. Le rôle d'administrateur est requis.
                    {currentUser && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Rôle actuel : {currentUser.role || "Aucun rôle"}
                        </Typography>
                    )}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Gestion des Utilisateurs
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
                        label="Recherche par nom ou email"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{ mr: 1 }}
                    />
                    <SearchIcon color="action" />
                </Box>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="role-filter-label">Filtrer par Rôle</InputLabel>
                    <Select
                        labelId="role-filter-label"
                        size="small"
                        value={roleFilter}
                        label="Filtrer par Rôle"
                        onChange={handleRoleFilterChange}
                    >
                        <MenuItem value="Tous">Tous</MenuItem>
                        <MenuItem value="ROLE_ADMIN">Administrateur</MenuItem>
                        <MenuItem value="ROLE_MANAGER">Gestionnaire</MenuItem>
                        <MenuItem value="ROLE_PROCESSING">Traitement</MenuItem>
                        <MenuItem value="ROLE_FRONTDESK">Accueil</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('add')}
                >
                    Nouvel Utilisateur
                </Button>
            </Box>

            {filteredUsers.length > 0 ? (
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
                        <Table stickyHeader aria-label="users table">
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        onClick={() => handleRequestSort('id')}
                                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        ID {orderBy === 'id' && (order === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleRequestSort('username')}
                                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        Nom d'utilisateur {orderBy === 'username' && (order === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleRequestSort('email')}
                                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        Email {orderBy === 'email' && (order === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleRequestSort('role')}
                                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        Rôle {orderBy === 'role' && (order === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedUsers.map((user) => (
                                    <TableRow hover key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role?.replace("ROLE_", "")}
                                                color={getRoleChipColor(user.role)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenDialog('edit', user)}
                                                sx={{ mr: 1 }}
                                            >
                                                Modifier
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDialog('delete', user)}
                                            >
                                                Supprimer
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
                        count={filteredUsers.length}
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
                </Paper>
            ) : (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                        Aucun utilisateur trouvé.
                    </Typography>
                    {(searchQuery || roleFilter !== "Tous") && (
                        <Button
                            variant="text"
                            onClick={() => {
                                setSearchQuery("");
                                setRoleFilter("Tous");
                            }}
                        >
                            Effacer les filtres
                        </Button>
                    )}
                </Paper>
            )}

            {/* Dialog for add/edit/delete/reassign-delete */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {dialogType === 'add' && "Ajouter un utilisateur"}
                    {dialogType === 'edit' && "Modifier l'utilisateur"}
                    {dialogType === 'delete' && "Supprimer l'utilisateur"}
                    {dialogType === 'reassign-delete' && "Réassigner et supprimer l'utilisateur"}
                </DialogTitle>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annuler</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color={(dialogType === 'delete' || dialogType === 'reassign-delete') ? "error" : "primary"}
                        disabled={dialogType === 'reassign-delete' && !reassignToUserId}
                    >
                        {dialogType === 'add' && "Ajouter"}
                        {dialogType === 'edit' && "Enregistrer"}
                        {dialogType === 'delete' && "Supprimer"}
                        {dialogType === 'reassign-delete' && "Réassigner et Supprimer"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserManagement; 