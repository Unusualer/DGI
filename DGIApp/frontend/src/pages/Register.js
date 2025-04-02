import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    Paper,
} from "@mui/material";
import AuthService from "../services/auth.service";

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("frontdesk");
    const [message, setMessage] = useState("");
    const [successful, setSuccessful] = useState(false);

    const handleRegister = (e) => {
        e.preventDefault();
        setMessage("");
        setSuccessful(false);

        AuthService.register(username, email, password, role)
            .then((response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            })
            .catch((error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                setMessage(resMessage);
                setSuccessful(false);
            });
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Inscription
                </Typography>

                {message && (
                    <Alert severity={successful ? "success" : "error"} sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleRegister} noValidate>
                    <TextField
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
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Adresse Email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
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

                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <FormLabel component="legend">Rôle</FormLabel>
                        <RadioGroup
                            row
                            aria-label="role"
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <FormControlLabel
                                value="frontdesk"
                                control={<Radio />}
                                label="Accueil"
                            />
                            <FormControlLabel
                                value="processing"
                                control={<Radio />}
                                label="Traitement"
                            />
                            <FormControlLabel
                                value="manager"
                                control={<Radio />}
                                label="Gestionnaire"
                            />
                            <FormControlLabel
                                value="admin"
                                control={<Radio />}
                                label="Administrateur"
                            />
                        </RadioGroup>
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        S'inscrire
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default Register;