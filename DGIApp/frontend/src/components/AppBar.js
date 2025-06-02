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
    Avatar,
    Badge,
    Tooltip,
    Divider
} from "@mui/material";
import {
    Menu as MenuIcon,
    AccountCircle,
    Notifications as NotificationsIcon,
    Brightness4 as Brightness4Icon,
    BrightnessHigh as BrightnessHighIcon
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";

const drawerWidth = 240;

const AppBarStyled = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    boxShadow: '0 1px 10px 0 rgba(0,0,0,0.05)',
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const NavButton = styled(Button)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    margin: theme.spacing(0, 0.5),
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
        color: theme.palette.primary.contrastText,
    },
    borderRadius: theme.shape.borderRadius,
    textTransform: 'none',
    fontWeight: 500,
    '&.MuiButton-contained': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
        }
    }
}));

function AppBar({ currentUser, logOut, toggleSidebar, sidebarOpen }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationsMenu = (event) => {
        setNotificationsAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationsClose = () => {
        setNotificationsAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logOut();
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppBarStyled position="fixed" open={sidebarOpen} color="primary">
            <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
                <IconButton
                    color="inherit"
                    aria-label="toggle sidebar"
                    onClick={toggleSidebar}
                    edge="start"
                    sx={{
                        mr: 2,
                        backgroundColor: alpha('#fff', 0.1),
                        '&:hover': {
                            backgroundColor: alpha('#fff', 0.2),
                        }
                    }}
                    size="small"
                >
                    <MenuIcon />
                </IconButton>

                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        display: { xs: "none", sm: "block" },
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                    }}
                >
                    Gestion BATC
                </Typography>

                {currentUser ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
                            <NavButton
                                component={Link}
                                to="/"
                                color="inherit"
                                sx={{ ml: 1 }}
                            >
                                Accueil
                            </NavButton>

                            {(currentUser.role === "ROLE_FRONTDESK" ||
                                currentUser.role === "ROLE_PROCESSING" ||
                                currentUser.role === "ROLE_MANAGER") && (
                                    <NavButton
                                        component={Link}
                                        to="/requests"
                                        color="inherit"
                                        sx={{ ml: 1 }}
                                    >
                                        Demandes
                                    </NavButton>
                                )}

                            {(currentUser.role === "ROLE_FRONTDESK" ||
                                currentUser.role === "ROLE_PROCESSING" ||
                                currentUser.role === "ROLE_MANAGER") && (
                                    <NavButton
                                        component={Link}
                                        to="/attestation-list"
                                        color="inherit"
                                        sx={{ ml: 1 }}
                                    >
                                        Attestations
                                    </NavButton>
                                )}

                            {currentUser.role === "ROLE_ADMIN" && (
                                <NavButton
                                    component={Link}
                                    to="/users"
                                    color="inherit"
                                    sx={{ ml: 1 }}
                                >
                                    Utilisateurs
                                </NavButton>
                            )}
                        </Box>

                        <Tooltip title={currentUser.username}>
                            <IconButton
                                aria-label="compte utilisateur"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                                sx={{ ml: 1 }}
                            >
                                <StyledBadge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                >
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                        {getInitials(currentUser.username)}
                                    </Avatar>
                                </StyledBadge>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                sx: {
                                    minWidth: 180,
                                    mt: 0.5
                                }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: 'secondary.main',
                                        mx: 'auto',
                                        mb: 1
                                    }}
                                >
                                    {getInitials(currentUser.username)}
                                </Avatar>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {currentUser.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {currentUser.role.replace("ROLE_", "")}
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem component={Link} to="/profile" onClick={handleClose}>
                                Profil
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box>
                        <NavButton component={Link} to="/login" color="inherit">
                            Connexion
                        </NavButton>
                        <NavButton component={Link} to="/register" color="inherit">
                            S'inscrire
                        </NavButton>
                    </Box>
                )}
            </Toolbar>
        </AppBarStyled>
    );
}

export default AppBar; 