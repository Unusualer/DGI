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
    Grid,
    InputAdornment,
    Fade,
    Zoom,
} from "@mui/material";
import {
    Login as LoginIcon,
    Person as PersonIcon,
    Lock as LockIcon,
} from "@mui/icons-material";
import AuthService from "../services/auth.service";
import { APP_NAME } from "../config/constants";

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
        <Box
            sx={{
                minHeight: "93vh",
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
                py: 1,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 20%, rgba(30, 136, 229, 0.05) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    {/* Left side - Welcome message */}
                    <Grid item xs={12} md={6}>
                        <Fade in timeout={1000}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    mb: { xs: 3, md: 0 },
                                    px: { xs: 2, md: 4 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2.5
                                }}
                            >
                                <Zoom in timeout={1000} style={{ transitionDelay: '300ms' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 2
                                        }}
                                    >
                                        <img
                                            src="/logo.png"
                                            alt="DGI Logo"
                                            style={{
                                                height: '200px',
                                                objectFit: 'contain',
                                                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                                                transition: 'transform 0.3s ease-in-out',
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                        <Typography
                                            variant="h2"
                                            component="h1"
                                            sx={{
                                                fontWeight: 800,
                                                color: "primary.main",
                                                letterSpacing: '-0.5px',
                                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                background: 'linear-gradient(45deg, #1e88e5 30%, #1565c0 90%)',
                                                backgroundClip: 'text',
                                                textFillColor: 'transparent',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}
                                        >
                                            {APP_NAME}
                                        </Typography>
                                    </Box>
                                </Zoom>
                                <Fade in timeout={1000} style={{ transitionDelay: '600ms' }}>
                                    <Typography
                                        variant="h3"
                                        color="text.primary"
                                        sx={{
                                            fontWeight: 600,
                                            letterSpacing: '-0.5px',
                                            background: 'linear-gradient(45deg, #1e88e5 30%, #1565c0 90%)',
                                            backgroundClip: 'text',
                                            textFillColor: 'transparent',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}
                                    >
                                        Bienvenue sur la plateforme
                                    </Typography>
                                </Fade>
                                <Fade in timeout={1000} style={{ transitionDelay: '900ms' }}>
                                    <Typography
                                        variant="h5"
                                        color="text.secondary"
                                        sx={{
                                            fontWeight: 400,
                                            lineHeight: 1.4
                                        }}
                                    >
                                        Connectez-vous pour accéder à votre espace
                                    </Typography>
                                </Fade>
                                <Fade in timeout={1000} style={{ transitionDelay: '1200ms' }}>
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                        sx={{
                                            maxWidth: '500px',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        Gérez vos demandes et suivez leur progression en toute simplicité
                                    </Typography>
                                </Fade>
                            </Box>
                        </Fade>
                    </Grid>

                    {/* Right side - Login form */}
                    <Grid item xs={12} md={6}>
                        <Zoom in timeout={1000} style={{ transitionDelay: '1500ms' }}>
                            <Paper
                                elevation={4}
                                sx={{
                                    p: { xs: 3, md: 5 },
                                    borderRadius: 3,
                                    bgcolor: "background.paper",
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255, 255, 255, 0.18)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #1e88e5 0%, #1565c0 100%)'
                                    }
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    align="center"
                                    gutterBottom
                                    sx={{
                                        mb: 4,
                                        fontWeight: 700,
                                        color: 'primary.main',
                                        letterSpacing: '-0.5px'
                                    }}
                                >
                                    Connexion
                                </Typography>

                                {message && (
                                    <Alert
                                        severity="error"
                                        sx={{
                                            mb: 3,
                                            borderRadius: 2,
                                            "& .MuiAlert-icon": {
                                                alignItems: "center",
                                            },
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        {message}
                                    </Alert>
                                )}

                                <Box component="form" onSubmit={handleLogin}>
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
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover fieldset': {
                                                    borderColor: 'primary.main',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderWidth: 2
                                                }
                                            }
                                        }}
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
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover fieldset': {
                                                    borderColor: 'primary.main',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderWidth: 2
                                                }
                                            }
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                                        sx={{
                                            py: 1.5,
                                            mb: 2,
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontSize: "1.1rem",
                                            fontWeight: 600,
                                            boxShadow: '0 4px 12px rgba(30, 136, 229, 0.2)',
                                            background: 'linear-gradient(45deg, #1e88e5 30%, #1565c0 90%)',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                boxShadow: '0 6px 16px rgba(30, 136, 229, 0.3)',
                                                transform: 'translateY(-1px)',
                                                background: 'linear-gradient(45deg, #1976d2 30%, #0d47a1 90%)',
                                            },
                                            '&:active': {
                                                transform: 'translateY(0)',
                                            }
                                        }}
                                    >
                                        {loading ? "Connexion..." : "Se Connecter"}
                                    </Button>

                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: '0.875rem',
                                                color: 'text.secondary',
                                                '& a': {
                                                    color: 'primary.main',
                                                    textDecoration: 'none',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s ease-in-out',
                                                    '&:hover': {
                                                        textDecoration: 'underline',
                                                        color: 'primary.dark'
                                                    }
                                                }
                                            }}
                                        >
                                            Mot de passe oublié ? Contactez votre administrateur
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Zoom>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default Login; 