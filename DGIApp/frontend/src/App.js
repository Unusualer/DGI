import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import "./App.css";
import axios from "axios";

import AuthService from "./services/auth.service";
import setupAxios from './services/axios-config';

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

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
    },
});

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
        console.log("App mounting - initializing auth and axios...");
        setupAxios();

        // Handle auth initialization
        const initAuth = () => {
            try {
                const user = AuthService.getCurrentUser();
                if (user) {
                    console.log("User found on app init:", user.username);

                    // Enhanced user role debugging
                    console.log("User role from localStorage:", user.role);

                    // Check authorities array
                    if (user.authorities && Array.isArray(user.authorities)) {
                        console.log("User authorities array:", user.authorities);
                    } else {
                        console.log("No authorities array found, using role property:", user.role);
                    }

                    setCurrentUser(user);
                    // Check if user is admin
                    setShowAdminBoard(user.role.includes("ADMIN"));
                    // Check if user is manager
                    setShowManagerBoard(user.role.includes("MANAGER"));
                    // Check if user is frontdesk
                    setShowFrontdeskBoard(user.role.includes("FRONTDESK"));
                    // Ensure auth header is set by calling setAuthHeader again
                    if (user.accessToken) {
                        AuthService.setAuthHeader(user.accessToken);
                    }

                    // Ensure the token is set in axios headers at application startup
                    if (user.accessToken) {
                        console.log("Setting axios auth header on application start");
                        axios.defaults.headers.common["Authorization"] = `Bearer ${user.accessToken}`;
                    }
                } else {
                    console.log("No user found on app init");
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Error initializing auth:", error);
                setCurrentUser(null);
            }
        };

        initAuth();

        // Register the auth change event listener
        const handleAuthChange = () => {
            console.log("Auth change event detected");
            const updatedUser = AuthService.getCurrentUser();

            if (updatedUser) {
                setCurrentUser(updatedUser);
                setShowAdminBoard(updatedUser.role.includes("ADMIN"));
                setShowManagerBoard(updatedUser.role.includes("MANAGER"));
                setShowProcessingBoard(updatedUser.role.includes("PROCESSING"));
                setShowFrontdeskBoard(updatedUser.role.includes("FRONTDESK"));

                // Reset axios auth header when auth changes
                if (updatedUser.accessToken) {
                    console.log("Updating axios auth header on auth change");
                    axios.defaults.headers.common["Authorization"] = `Bearer ${updatedUser.accessToken}`;
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

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App; 