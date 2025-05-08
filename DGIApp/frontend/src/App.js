import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import "./App.css";
import axios from "axios";
import { frFR } from '@mui/material/locale';

import AuthService from "./services/auth.service";
import { setupAxios } from './services/axios-config';

// Components
import AppBar from "./components/AppBar";
import Sidebar from "./components/Sidebar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RequestList from "./pages/RequestList";
import RequestDetail from "./pages/RequestDetail";
import CreateRequest from "./pages/CreateRequest";
import TrackRequest from "./pages/TrackRequest";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import EditRequest from "./pages/EditRequest";
import AttestationList from "./pages/AttestationList";
import AttestationDetail from "./pages/AttestationDetail";
import CreateAttestation from "./pages/CreateAttestation";
import TypeAttestationList from "./pages/TypeAttestationList";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
    },
}, frFR);

function App() {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const [showAdminBoard, setShowAdminBoard] = useState(false);
    const [showManagerBoard, setShowManagerBoard] = useState(false);
    const [showFrontdeskBoard, setShowFrontdeskBoard] = useState(false);
    const [showProcessingBoard, setShowProcessingBoard] = useState(false);

    // Initialize auth and axios on first load
    useEffect(() => {
        setupAxios();

        // Handle auth initialization
        const initAuth = () => {
            try {
                // Check if there's a user in localStorage
                const user = AuthService.getCurrentUser();

                if (user) {
                    // Validate token before setting user
                    if (!AuthService.isTokenValid()) {
                        localStorage.removeItem('user');
                        setCurrentUser(null);
                        return;
                    }

                    // Set user state
                    setCurrentUser(user);

                    // Set role flags for nav menu
                    if (user.authorities && Array.isArray(user.authorities)) {
                        // If authorities array is present, use it
                        setShowAdminBoard(user.authorities.some(auth => auth.authority === "ROLE_ADMIN"));
                        setShowManagerBoard(user.authorities.some(auth => auth.authority === "ROLE_MANAGER"));
                        setShowProcessingBoard(user.authorities.some(auth => auth.authority === "ROLE_PROCESSING"));
                        setShowFrontdeskBoard(user.authorities.some(auth => auth.authority === "ROLE_FRONTDESK"));
                    } else {
                        // Fallback to role property
                        setShowAdminBoard(user.role.includes("ADMIN"));
                        setShowManagerBoard(user.role.includes("MANAGER"));
                        setShowProcessingBoard(user.role.includes("PROCESSING"));
                        setShowFrontdeskBoard(user.role.includes("FRONTDESK"));
                    }

                    // Ensure the token is set in axios headers at application startup
                    const token = user.token || user.accessToken;
                    if (token) {
                        AuthService.setAuthHeader(token);
                    }
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                setCurrentUser(null);
            }
        };

        initAuth();

        // Register the auth change event listener
        const handleAuthChange = () => {
            const updatedUser = AuthService.getCurrentUser();

            if (updatedUser) {
                setCurrentUser(updatedUser);
                setShowAdminBoard(updatedUser.role.includes("ADMIN"));
                setShowManagerBoard(updatedUser.role.includes("MANAGER"));
                setShowProcessingBoard(updatedUser.role.includes("PROCESSING"));
                setShowFrontdeskBoard(updatedUser.role.includes("FRONTDESK"));

                // Reset axios auth header when auth changes
                const token = updatedUser.token || updatedUser.accessToken;
                if (token) {
                    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                }
            } else {
                // Clear the auth header when logged out
                delete axios.defaults.headers.common["Authorization"];
            }
        };

        window.addEventListener("auth-change", handleAuthChange);

        return () => {
            window.removeEventListener("auth-change", handleAuthChange);
        };
    }, []);

    // Check if the current route is a public route (login or register)
    const isPublicRoute = ['/login', '/register'].includes(location.pathname);

    const logOut = () => {
        AuthService.logout();
        setCurrentUser(undefined);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Protected route component
    const ProtectedRoute = ({ children, roles }) => {
        if (!currentUser) {
            return <Navigate to="/login" />;
        }

        // Check if route requires specific role
        if (roles && !roles.includes(currentUser.role)) {
            return <Navigate to="/" />;
        }

        return children;
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex" }}>
                {currentUser && !isPublicRoute && (
                    <>
                        <AppBar
                            currentUser={currentUser}
                            logOut={logOut}
                            toggleSidebar={toggleSidebar}
                            sidebarOpen={sidebarOpen}
                        />
                        <Sidebar
                            currentUser={currentUser}
                            open={sidebarOpen}
                            toggleSidebar={toggleSidebar}
                        />
                    </>
                )}

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        mt: currentUser && !isPublicRoute ? 8 : 0,
                        width: "100%",
                        minHeight: "100vh",
                    }}
                >
                    <Routes>
                        <Route path="/" element={currentUser ? <Home /> : <Navigate to="/login" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute roles={["ROLE_MANAGER"]}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/requests"
                            element={
                                <ProtectedRoute roles={["ROLE_FRONTDESK", "ROLE_PROCESSING", "ROLE_MANAGER"]}>
                                    <RequestList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/requests/:id"
                            element={
                                <ProtectedRoute roles={["ROLE_FRONTDESK", "ROLE_PROCESSING", "ROLE_MANAGER"]}>
                                    <RequestDetail />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/create-request"
                            element={
                                <ProtectedRoute roles={["ROLE_FRONTDESK", "ROLE_MANAGER", "ROLE_PROCESSING"]}>
                                    <CreateRequest />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/edit-request/:id"
                            element={
                                <ProtectedRoute roles={["ROLE_FRONTDESK", "ROLE_MANAGER"]}>
                                    <EditRequest />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                                    <UserManagement />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_PROCESSING", "ROLE_FRONTDESK"]}>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/track-request" element={<TrackRequest />} />

                        {/* Attestation Routes */}
                        <Route
                            path="/attestation-list"
                            element={
                                <ProtectedRoute roles={["ROLE_FRONTDESK", "ROLE_MANAGER", "ROLE_PROCESSING"]}>
                                    <AttestationList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/attestation/:id"
                            element={
                                <ProtectedRoute roles={["ROLE_FRONTDESK", "ROLE_MANAGER", "ROLE_PROCESSING"]}>
                                    <AttestationDetail />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/create-attestation"
                            element={
                                <ProtectedRoute roles={["ROLE_FRONTDESK", "ROLE_MANAGER", "ROLE_PROCESSING"]}>
                                    <CreateAttestation />
                                </ProtectedRoute>
                            }
                        />

                        {/* Type Attestation Routes - MANAGER only */}
                        <Route
                            path="/type-attestations"
                            element={
                                <ProtectedRoute roles={["ROLE_MANAGER"]}>
                                    <TypeAttestationList />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App; 