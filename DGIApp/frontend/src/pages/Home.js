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
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    Assignment as AssignmentIcon,
    AddCircle as AddCircleIcon,
    Search as SearchIcon,
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
            return "Welcome to DGI Request Management System";
        }

        let roleName = currentUser.role.replace("ROLE_", "");
        return `Welcome, ${currentUser.username} (${roleName})`;
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {getWelcomeMessage()}
                </Typography>

                <Paper
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: "#f9f9f9",
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="body1" paragraph>
                        This application allows users to submit requests, track their
                        progress through specific states, and manage ownership of requests.
                    </Typography>

                    {!currentUser && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                component={Link}
                                to="/login"
                                variant="contained"
                                color="primary"
                                sx={{ mr: 2 }}
                            >
                                Sign In
                            </Button>
                            <Button component={Link} to="/register" variant="outlined">
                                Sign Up
                            </Button>
                        </Box>
                    )}
                </Paper>

                {currentUser && (
                    <Grid container spacing={3}>
                        {/* Dashboard Card - Manager Only */}
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
                                                Dashboard
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                View all requests and monitor their statuses
                                            </Typography>
                                            <Button
                                                component={Link}
                                                to="/dashboard"
                                                variant="contained"
                                            >
                                                Access Dashboard
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* Requests List Card - Frontdesk, Processing, Manager */}
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
                                                    Requests
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    View and manage your requests
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    to="/requests"
                                                    variant="contained"
                                                >
                                                    View Requests
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                        {/* Create Request Card - Frontdesk, Manager, Processing */}
                        {(currentUser.role === "ROLE_FRONTDESK" ||
                            currentUser.role === "ROLE_MANAGER" ||
                            currentUser.role === "ROLE_PROCESSING") && (
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
                                                <AddCircleIcon
                                                    color="primary"
                                                    sx={{ fontSize: 60, mb: 2 }}
                                                />
                                                <Typography variant="h6" gutterBottom>
                                                    New Request
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    Submit a new request to the system
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    to="/create-request"
                                                    variant="contained"
                                                >
                                                    Create Request
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
                                                User Management
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                Manage system users and their roles
                                            </Typography>
                                            <Button
                                                component={Link}
                                                to="/users"
                                                variant="contained"
                                            >
                                                Manage Users
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