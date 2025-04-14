import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Paper,
    CircularProgress,
} from "@mui/material";
import AuthService from "../services/auth.service";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            await AuthService.login(username, password);
            navigate("/");
        } catch (error) {
            console.error("Login error:", error);

            let errorMessage = "Une erreur s'est produite lors de la connexion";

            if (error.response) {
                console.error("Error response:", error.response);
                errorMessage = error.response.data?.message ||
                    `Erreur serveur: ${error.response.status}`;
            } else if (error.request) {
                console.error("No response received:", error.request);
                errorMessage = "Aucune réponse du serveur. Veuillez vérifier votre connexion.";
            } else {
                console.error("Error:", error.message);
                errorMessage = `Erreur: ${error.message}`;
            }

            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ pt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Connexion
                </Typography>

                <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                    {message && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {message}
                        </Alert>
                    )}

                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Nom d'utilisateur"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mot de passe"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Se Connecter"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login; 