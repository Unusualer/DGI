import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Paper,
    Divider,
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    Assignment as AssignmentIcon,
    AddCircle as AddCircleIcon,
    Description as DescriptionIcon,
    People as PeopleIcon,
} from "@mui/icons-material";
import AuthService from "../services/auth.service";

function Home() {
    const [currentUser, setCurrentUser] = useState(undefined);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    const getWelcomeMessage = () => {
        if (!currentUser) {
            return "Bienvenue au Système de Gestion DGI";
        }

        let roleName = currentUser.role.replace("ROLE_", "");
        return `Bienvenue, ${currentUser.username} (${roleName})`;
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        mb: 3
                    }}
                >
                    {getWelcomeMessage()}
                </Typography>

                {!currentUser && (
                    <Box sx={{
                        mt: 2,
                        display: 'flex',
                        gap: 2
                    }}>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                    color: 'primary.contrastText'
                                }
                            }}
                        >
                            Se Connecter
                        </Button>
                    </Box>
                )}

                {currentUser && (
                    <Grid container spacing={3}>
                        {/* Tableau de Bord Card - Manager Only */}
                        {currentUser.role === "ROLE_MANAGER" && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Card sx={{ height: "100%" }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                textAlign: "center",
                                            }}
                                        >
                                            <DashboardIcon
                                                color="primary"
                                                sx={{ fontSize: 60, mb: 2 }}
                                            />
                                            <Typography variant="h6" gutterBottom>
                                                Tableau de Bord
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                Visualisez toutes les demandes et suivez leur statut
                                            </Typography>
                                            <Button
                                                component={Link}
                                                to="/dashboard"
                                                variant="contained"
                                                fullWidth
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'primary.dark',
                                                        color: 'primary.contrastText'
                                                    }
                                                }}
                                            >
                                                Accéder au Tableau de Bord
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* Demandes Card - Frontdesk, Processing, Manager */}
                        {(currentUser.role === "ROLE_FRONTDESK" ||
                            currentUser.role === "ROLE_PROCESSING" ||
                            currentUser.role === "ROLE_MANAGER") && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ height: "100%" }}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <AssignmentIcon
                                                    color="primary"
                                                    sx={{ fontSize: 60, mb: 2 }}
                                                />
                                                <Typography variant="h6" gutterBottom>
                                                    Demandes
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    Consultez et gérez vos demandes
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    to="/requests"
                                                    variant="contained"
                                                    fullWidth
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: 'primary.dark',
                                                            color: 'primary.contrastText'
                                                        }
                                                    }}
                                                >
                                                    Voir les Demandes
                                                </Button>
                                                <Divider sx={{ my: 2, width: '100%' }} />
                                                <Button
                                                    component={Link}
                                                    to="/create-request"
                                                    variant="outlined"
                                                    fullWidth
                                                    startIcon={<AddCircleIcon />}
                                                >
                                                    Nouvelle Demande
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                        {/* Attestations Card - Frontdesk, Processing, Manager */}
                        {(currentUser.role === "ROLE_FRONTDESK" ||
                            currentUser.role === "ROLE_PROCESSING" ||
                            currentUser.role === "ROLE_MANAGER") && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ height: "100%" }}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <DescriptionIcon
                                                    color="primary"
                                                    sx={{ fontSize: 60, mb: 2 }}
                                                />
                                                <Typography variant="h6" gutterBottom>
                                                    Attestations
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    Gérez les attestations et certificats
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    to="/attestation-list"
                                                    variant="contained"
                                                    fullWidth
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: 'primary.dark',
                                                            color: 'primary.contrastText'
                                                        }
                                                    }}
                                                >
                                                    Voir les Attestations
                                                </Button>
                                                <Divider sx={{ my: 2, width: '100%' }} />
                                                <Button
                                                    component={Link}
                                                    to="/create-attestation"
                                                    variant="outlined"
                                                    fullWidth
                                                    startIcon={<AddCircleIcon />}
                                                >
                                                    Nouvelle Attestation
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                        {/* User Management Card - Admin Only */}
                        {currentUser.role === "ROLE_ADMIN" && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Card sx={{ height: "100%" }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                textAlign: "center",
                                            }}
                                        >
                                            <PeopleIcon
                                                color="primary"
                                                sx={{ fontSize: 60, mb: 2 }}
                                            />
                                            <Typography variant="h6" gutterBottom>
                                                Gestion des Utilisateurs
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                Gérez les utilisateurs du système et leurs rôles
                                            </Typography>
                                            <Button
                                                component={Link}
                                                to="/users"
                                                variant="contained"
                                                fullWidth
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'primary.dark',
                                                        color: 'primary.contrastText'
                                                    }
                                                }}
                                            >
                                                Gérer les Utilisateurs
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>
        </Container>
    );
}

export default Home; 