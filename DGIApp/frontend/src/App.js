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
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RequestList from "./pages/RequestList";
import RequestDetail from "./pages/RequestDetail";
import CreateRequest from "./pages/CreateRequest";
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
            main: "#003671",
            light: "#335c8c",
            dark: "#001c3a",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#ff6e40",
            light: "#ffa06d",
            dark: "#c53d13",
            contrastText: "#ffffff",
        },
        background: {
            default: "#f5f7fa",
            paper: "#ffffff"
        },
        error: {
            main: "#f44336",
        },
        warning: {
            main: "#ff9800",
        },
        info: {
            main: "#03a9f4",
        },
        success: {
            main: "#4caf50",
        },
        grey: {
            50: "#fafafa",
            100: "#f5f5f5",
            200: "#eeeeee",
            300: "#e0e0e0",
            400: "#bdbdbd",
            500: "#9e9e9e",
            600: "#757575",
            700: "#616161",
            800: "#424242",
            900: "#212121",
        },
    },
    typography: {
        fontFamily: [
            'Roboto',
            'Arial',
            'sans-serif'
        ].join(','),
        h1: {
            fontWeight: 500,
            fontSize: '2rem',
        },
        h2: {
            fontWeight: 500,
            fontSize: '1.8rem',
        },
        h3: {
            fontWeight: 500,
            fontSize: '1.6rem',
        },
        h4: {
            fontWeight: 500,
            fontSize: '1.4rem',
        },
        h5: {
            fontWeight: 500,
            fontSize: '1.2rem',
        },
        h6: {
            fontWeight: 500,
            fontSize: '1rem',
        },
        subtitle1: {
            fontSize: '0.875rem',
        },
        subtitle2: {
            fontSize: '0.8rem',
            fontWeight: 500,
        },
        body1: {
            fontSize: '0.875rem',
        },
        body2: {
            fontSize: '0.8rem',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500
        }
    },
    shape: {
        borderRadius: 8
    },
    shadows: [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.08), 0px 1px 1px 0px rgba(0,0,0,0.04), 0px 1px 3px 0px rgba(0,0,0,0.02)',
        '0px 3px 1px -2px rgba(0,0,0,0.1), 0px 2px 2px 0px rgba(0,0,0,0.05), 0px 1px 5px 0px rgba(0,0,0,0.03)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        // ...rest of the shadows remain default
    ].concat(createTheme().shadows.slice(4)),
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 5px 0 rgba(0,0,0,.08)',
                    '&:hover': {
                        boxShadow: '0 4px 10px 0 rgba(0,0,0,.12)',
                    },
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,.05)'
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    backgroundColor: "rgba(0, 0, 0, 0.03)"
                }
            }
        }
    }
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