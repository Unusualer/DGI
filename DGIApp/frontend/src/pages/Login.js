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
import axios from "axios";
import { getServerUrl } from "../services/axios-config";
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
            // Direct login without abstractions to debug the issue
            const loginUrl = `${getServerUrl()}/api/auth/signin`;
            console.log("Attempting login to:", loginUrl);

            const response = await axios.post(loginUrl, {
                username,
                password,
            });

            console.log("Login response:", response.data);

            if (response.data.accessToken) {
                localStorage.setItem("user", JSON.stringify(response.data));
                axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
                window.dispatchEvent(new Event('auth-change'));
                navigate("/");
            } else {
                setMessage("Login successful but no token received");
            }
        } catch (error) {
            console.error("Login error:", error);

            let errorMessage = "An error occurred during login";

            if (error.response) {
                console.error("Error response:", error.response);
                errorMessage = error.response.data?.message ||
                    `Server error: ${error.response.status}`;
            } else if (error.request) {
                console.error("No response received:", error.request);
                errorMessage = "No response from server. Please check your connection.";
            } else {
                console.error("Error:", error.message);
                errorMessage = `Error: ${error.message}`;
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