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
                        <ListItemText primary="Home" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                </ListItem>

                {/* Show dashboard link only for managers */}
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
                                primary="Dashboard"
                                sx={{ opacity: open ? 1 : 0 }}
                            />
                        </ListItemButton>
                    </ListItem>
                )}

                {/* Show requests list link for frontdesk, processing, and manager */}
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
                                    primary="Requests"
                                    sx={{ opacity: open ? 1 : 0 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}

                {/* Show create request link for frontdesk, manager, and processing */}
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
                                    primary="New Request"
                                    sx={{ opacity: open ? 1 : 0 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}

                {/* Show user management link for admin */}
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
                            <ListItemText primary="Users" sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>

            <Box sx={{ flexGrow: 1 }} />
            <Divider />
        </Drawer>
    );
}

export default Sidebar; 