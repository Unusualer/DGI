import React from "react";
import { Link } from "react-router-dom";
import {
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Menu,
    MenuItem,
    Button,
} from "@mui/material";
import {
    Menu as MenuIcon,
    AccountCircle,
    Notifications,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const drawerWidth = 240;

const AppBarStyled = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

function AppBar({ currentUser, logOut, toggleSidebar, sidebarOpen }) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logOut();
    };

    return (
        <AppBarStyled position="fixed" open={sidebarOpen}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="toggle sidebar"
                    onClick={toggleSidebar}
                    edge="start"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
                >
                    Gestion des Demandes DGI
                </Typography>

                {currentUser ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Button
                            component={Link}
                            to="/"
                            color="inherit"
                            sx={{ ml: 1, display: { xs: "none", md: "block" } }}
                        >
                            Accueil
                        </Button>

                        {(currentUser.role === "ROLE_FRONTDESK" ||
                            currentUser.role === "ROLE_MANAGER" ||
                            currentUser.role === "ROLE_PROCESSING") && (
                                <Button
                                    component={Link}
                                    to="/create-request"
                                    color="inherit"
                                    sx={{ ml: 1, display: { xs: "none", md: "block" } }}
                                >
                                    Nouvelle Demande
                                </Button>
                            )}

                        {(currentUser.role === "ROLE_FRONTDESK" ||
                            currentUser.role === "ROLE_PROCESSING" ||
                            currentUser.role === "ROLE_MANAGER") && (
                                <Button
                                    component={Link}
                                    to="/requests"
                                    color="inherit"
                                    sx={{ ml: 1, display: { xs: "none", md: "block" } }}
                                >
                                    Demandes
                                </Button>
                            )}

                        {currentUser.role === "ROLE_MANAGER" && (
                            <Button
                                component={Link}
                                to="/dashboard"
                                color="inherit"
                                sx={{ ml: 1, display: { xs: "none", md: "block" } }}
                            >
                                Tableau de Bord
                            </Button>
                        )}

                        {currentUser.role === "ROLE_ADMIN" && (
                            <Button
                                component={Link}
                                to="/users"
                                color="inherit"
                                sx={{ ml: 1, display: { xs: "none", md: "block" } }}
                            >
                                Utilisateurs
                            </Button>
                        )}

                        <IconButton
                            aria-label="compte utilisateur"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem disabled>
                                {currentUser.username} ({currentUser.role.replace("ROLE_", "")})
                            </MenuItem>
                            <MenuItem component={Link} to="/profile" onClick={handleClose}>
                                Profil
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box>
                        <Button component={Link} to="/login" color="inherit">
                            Connexion
                        </Button>
                        <Button component={Link} to="/register" color="inherit">
                            S'inscrire
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBarStyled>
    );
}

export default AppBar; 