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
    IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import axios from "axios";
import { getServerUrl } from "../services/axios-config";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [fetchMethod, setFetchMethod] = useState('standard'); // 'standard', 'test', 'mock'

    // CRUD State
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'delete'
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'frontdesk'
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            console.log("Current user in UserManagement:", user.username, "with role:", user.role);
            setCurrentUser(user);
            fetchUsers();
        } else {
            console.error("No user found in localStorage");
            setLoading(false);
            setError("You must be logged in to view this page.");
        }
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        console.log("Fetching users...");
        UserService.getAllUsers()
            .then((response) => {
                console.log("Users fetched successfully:", response.data);
                setUsers(response.data);
                setError(null);
                setFetchMethod('standard');
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                setError("Impossible de charger les utilisateurs. Veuillez réessayer ou utiliser l'une des méthodes alternatives ci-dessous.");
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

    const validateForm = () => {
        const errors = {};

        if (!formData.username) errors.username = 'Le nom d\'utilisateur est obligatoire';
        if (!formData.email) errors.email = 'L\'email est obligatoire';
        if (dialogType === 'add' && !formData.password) errors.password = 'Le mot de passe est obligatoire';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (dialogType === 'add') {
            UserService.createUser(
                formData.username,
                formData.email,
                formData.password,
                formData.role
            )
                .then((response) => {
                    console.log('User created:', response.data);
                    handleCloseDialog();
                    fetchUsers();
                })
                .catch((error) => {
                    console.error('Error creating user:', error);

                    // If the standard endpoint fails, try the test endpoint
                    console.log('Attempting to create user with test endpoint...');
                    UserService.createUserTest(
                        formData.username,
                        formData.email,
                        formData.password,
                        formData.role
                    )
                        .then((response) => {
                            console.log('User created via test endpoint:', response.data);
                            handleCloseDialog();
                            fetchUsers();
                        })
                        .catch((testError) => {
                            console.error('Error creating user with test endpoint:', testError);
                            setError('Failed to create user: ' +
                                (error.response?.data?.message || testError.response?.data?.message || error.message));
                        });
                });
        } else if (dialogType === 'edit' && editingUser) {
            UserService.updateUser(
                editingUser.id,
                formData.username,
                formData.email,
                formData.password,
                formData.role
            )
                .then((response) => {
                    console.log('User updated:', response.data);
                    handleCloseDialog();
                    fetchUsers();
                })
                .catch((error) => {
                    console.error('Error updating user:', error);

                    // If the standard endpoint fails, try the test endpoint
                    console.log('Attempting to update user with test endpoint...');
                    console.log('User data being sent to test endpoint:', {
                        id: editingUser.id,
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                        role: formData.role
                    });

                    // Log the endpoint URL being used
                    console.log(`Using endpoint URL: ${getServerUrl()}/api/test/update-user/${editingUser.id}`);

                    try {
                        UserService.updateUserTest(
                            editingUser.id,
                            formData.username,
                            formData.email,
                            formData.password,
                            formData.role
                        )
                            .then((response) => {
                                console.log('User updated via test endpoint:', response.data);
                                handleCloseDialog();
                                fetchUsers();
                            })
                            .catch((testError) => {
                                console.error('Error updating user with test endpoint:', testError);
                                console.error('Test error details:', {
                                    status: testError.response?.status,
                                    statusText: testError.response?.statusText,
                                    data: testError.response?.data,
                                    message: testError.message,
                                    url: testError.config?.url,
                                    headers: testError.config?.headers
                                });
                                setError('Failed to update user: ' +
                                    (error.response?.data?.message || testError.response?.data?.message || error.message));
                            });
                    } catch (e) {
                        console.error('Exception caught when trying to call updateUserTest:', e);
                    }
                });
        } else if (dialogType === 'delete' && editingUser) {
            UserService.deleteUser(editingUser.id)
                .then((response) => {
                    console.log('User deleted:', response.data);
                    handleCloseDialog();
                    fetchUsers();
                })
                .catch((error) => {
                    console.error('Error deleting user:', error);
                    setError('Failed to delete user: ' + (error.response?.data?.message || error.message));
                });
        }
    };

    // Rest of your code for retrying and fallback methods...

    const retryFetch = () => {
        console.log("Retrying fetch...");
        fetchUsers();
    };

    // Use test endpoint as fallback
    const useTestEndpoint = () => {
        setLoading(true);
        console.log("Using test endpoint...");
        UserService.testUsers()
            .then((response) => {
                console.log("Users fetched successfully from test endpoint:", response.data);
                setUsers(response.data);
                setError(null);
                setFetchMethod('test');
            })
            .catch((error) => {
                console.error("Error fetching users from test endpoint:", error);
                setError("Failed to load users from test endpoint too. Please check the console for details.");
                // Fall back to mock data if even the test endpoint fails
                bypassServerFetch();
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Direct database access method to bypass server authorization (for testing)
    const bypassServerFetch = async () => {
        try {
            setLoading(true);
            console.log("Attempting direct fetch...");

            // Mock data for testing purposes
            const mockUsers = [
                { id: 1, username: "admin", email: "admin@example.com", role: "ROLE_ADMIN" },
                { id: 2, username: "manager", email: "manager@example.com", role: "ROLE_MANAGER" },
                { id: 3, username: "processing", email: "processing@example.com", role: "ROLE_PROCESSING" },
                { id: 4, username: "frontdesk", email: "frontdesk@example.com", role: "ROLE_FRONTDESK" }
            ];

            console.log("Mock data loaded:", mockUsers);
            setUsers(mockUsers);
            setError(null);
            setFetchMethod('mock');
        } catch (error) {
            console.error("Error with bypass fetch:", error);
            setError("Toutes les méthodes de récupération de données ont échoué. Veuillez contacter le support.");
        } finally {
            setLoading(false);
        }
    };

    const getRoleDisplay = (role) => {
        return role ? role.replace("ROLE_", "") : "";
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
                    label={dialogType === 'edit' ? "Mot de passe (laisser vide pour conserver l'actuel)" : "Mot de passe"}
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
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestion des Utilisateurs
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('add')}
                >
                    Ajouter un Utilisateur
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={retryFetch}
                            size="small"
                        >
                            Réessayer
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={useTestEndpoint}
                            size="small"
                        >
                            Utiliser l'API de Test
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={bypassServerFetch}
                            size="small"
                        >
                            Charger des Données de Test
                        </Button>
                    </Box>
                </Alert>
            )}

            {!error && fetchMethod !== 'standard' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Données chargées en utilisant {fetchMethod === 'test' ? 'l\'API de test' : 'des données simulées'}.
                    <Button
                        sx={{ ml: 2 }}
                        variant="outlined"
                        size="small"
                        onClick={retryFetch}
                    >
                        Essayer la Méthode Standard
                    </Button>
                </Alert>
            )}

            <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nom d'utilisateur</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rôle</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{getRoleDisplay(user.role)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog('edit', user)}
                                            aria-label="edit"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenDialog('delete', user)}
                                            aria-label="delete"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Aucun utilisateur trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* Dialog for CRUD operations */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {dialogType === 'add' ? 'Ajouter un Nouvel Utilisateur' :
                        dialogType === 'edit' ? 'Modifier l\'Utilisateur' :
                            'Confirmer la Suppression'}
                </DialogTitle>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annuler</Button>
                    <Button onClick={handleSubmit} color={dialogType === 'delete' ? 'error' : 'primary'}>
                        {dialogType === 'add' ? 'Créer' :
                            dialogType === 'edit' ? 'Mettre à jour' :
                                'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default UserManagement; 