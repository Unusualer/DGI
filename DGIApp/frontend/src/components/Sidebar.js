import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Drawer,
    List,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
} from "@mui/material";
import {
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    List as ListIcon,
    Add as AddIcon,
    Search as SearchIcon,
    People as PeopleIcon,
    Home as HomeIcon,
    Description as DescriptionIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}));

function Sidebar({ currentUser, open, toggleSidebar }) {
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            open={open}
            sx={{
                width: open ? drawerWidth : 73,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: open ? drawerWidth : 73,
                    boxSizing: "border-box",
                    overflowX: "hidden",
                    transition: (theme) =>
                        theme.transitions.create("width", {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                },
            }}
        >
            <DrawerHeader>
                <IconButton onClick={toggleSidebar}>
                    <ChevronLeftIcon />
                </IconButton>
            </DrawerHeader>
            <Divider />

            <List>
                {/* Accueil - Home */}
                <ListItem
                    disablePadding
                    sx={{
                        display: "block",
                        backgroundColor: location.pathname === "/" ? "#f0f0f0" : "inherit",
                    }}
                >
                    <ListItemButton
                        component={Link}
                        to="/"
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? "initial" : "center",
                            px: 2.5,
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 3 : "auto",
                                justifyContent: "center",
                            }}
                        >
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Accueil" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                </ListItem>

                {/* Dashboard for MANAGER */}
                {currentUser && currentUser.role === "ROLE_MANAGER" && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            backgroundColor:
                                location.pathname === "/dashboard" ? "#f0f0f0" : "inherit",
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/dashboard"
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : "auto",
                                    justifyContent: "center",
                                }}
                            >
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Tableau de Bord"
                                sx={{ opacity: open ? 1 : 0 }}
                            />
                        </ListItemButton>
                    </ListItem>
                )}

                {/* Demandes - Requests */}
                {currentUser &&
                    (currentUser.role === "ROLE_FRONTDESK" ||
                        currentUser.role === "ROLE_PROCESSING" ||
                        currentUser.role === "ROLE_MANAGER") && (
                        <ListItem
                            disablePadding
                            sx={{
                                display: "block",
                                backgroundColor:
                                    location.pathname === "/requests" ? "#f0f0f0" : "inherit",
                            }}
                        >
                            <ListItemButton
                                component={Link}
                                to="/requests"
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? "initial" : "center",
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : "auto",
                                        justifyContent: "center",
                                    }}
                                >
                                    <ListIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Demandes"
                                    sx={{ opacity: open ? 1 : 0 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}

                {/* Create Request */}
                {currentUser &&
                    (currentUser.role === "ROLE_FRONTDESK" ||
                        currentUser.role === "ROLE_MANAGER" ||
                        currentUser.role === "ROLE_PROCESSING") && (
                        <ListItem
                            disablePadding
                            sx={{
                                display: "block",
                                backgroundColor:
                                    location.pathname === "/create-request"
                                        ? "#f0f0f0"
                                        : "inherit",
                            }}
                        >
                            <ListItemButton
                                component={Link}
                                to="/create-request"
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? "initial" : "center",
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : "auto",
                                        justifyContent: "center",
                                    }}
                                >
                                    <AddIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Nouvelle Demande"
                                    sx={{ opacity: open ? 1 : 0 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}

                {/* Attestations */}
                {currentUser &&
                    (currentUser.role === "ROLE_FRONTDESK" ||
                        currentUser.role === "ROLE_MANAGER") && (
                        <ListItem
                            disablePadding
                            sx={{
                                display: "block",
                                backgroundColor:
                                    location.pathname === "/attestation-list"
                                        ? "#f0f0f0"
                                        : "inherit",
                            }}
                        >
                            <ListItemButton
                                component={Link}
                                to="/attestation-list"
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? "initial" : "center",
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : "auto",
                                        justifyContent: "center",
                                    }}
                                >
                                    <DescriptionIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Attestations"
                                    sx={{ opacity: open ? 1 : 0 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}

                {/* Create Attestation */}
                {currentUser &&
                    (currentUser.role === "ROLE_FRONTDESK" ||
                        currentUser.role === "ROLE_MANAGER") && (
                        <ListItem
                            disablePadding
                            sx={{
                                display: "block",
                                backgroundColor:
                                    location.pathname === "/create-attestation"
                                        ? "#f0f0f0"
                                        : "inherit",
                            }}
                        >
                            <ListItemButton
                                component={Link}
                                to="/create-attestation"
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? "initial" : "center",
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : "auto",
                                        justifyContent: "center",
                                    }}
                                >
                                    <AddIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Nouvelle Attestation"
                                    sx={{ opacity: open ? 1 : 0 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}

                {/* Admin - User Management */}
                {currentUser && currentUser.role === "ROLE_ADMIN" && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            backgroundColor:
                                location.pathname === "/users" ? "#f0f0f0" : "inherit",
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/users"
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : "auto",
                                    justifyContent: "center",
                                }}
                            >
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Utilisateurs"
                                sx={{ opacity: open ? 1 : 0 }}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Drawer>
    );
}

export default Sidebar; 