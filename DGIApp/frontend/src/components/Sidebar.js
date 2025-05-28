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
    Typography,
    Tooltip,
    Collapse,
    alpha,
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
    Category as CategoryIcon,
    ExpandLess,
    ExpandMore,
    Speed as SpeedIcon,
    Settings as SettingsIcon,
    Assignment as AssignmentIcon,
    Article as ArticleIcon,
    Summarize as SummarizeIcon,
    Assessment as AssessmentIcon,
    MoreHoriz as MoreHorizIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "space-between",
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    background: (theme) => alpha(theme.palette.primary.main, 0.02),
}));

const Logo = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    '& img': {
        height: '120px',
        width: 'auto',
        objectFit: 'contain'
    }
}));

function Sidebar({ currentUser, open, toggleSidebar }) {
    const location = useLocation();
    const [attestationOpen, setAttestationOpen] = React.useState(false);
    const [requestsOpen, setRequestsOpen] = React.useState(false);

    const handleAttestationClick = () => {
        setAttestationOpen(!attestationOpen);
    };

    const handleRequestsClick = () => {
        setRequestsOpen(!requestsOpen);
    };

    // Check if the current path is in a specific section
    const isAttestationSection = location.pathname.includes('/attestation');
    const isRequestsSection = location.pathname.includes('/request') &&
        !location.pathname.includes('/attestation');

    // Set the appropriate sections as open based on current path
    React.useEffect(() => {
        if (isAttestationSection) {
            setAttestationOpen(true);
        }
        if (isRequestsSection) {
            setRequestsOpen(true);
        }
    }, [isAttestationSection, isRequestsSection]);

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
                    borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                    background: (theme) => theme.palette.background.default,
                },
            }}
        >
            <DrawerHeader>
                {open && (
                    <Logo>
                        <img src="/DGI-logo.png" alt="DGI Logo" />
                    </Logo>
                )}
            </DrawerHeader>
            <Divider />

            <List sx={{ pt: 1 }} component="nav">
                {/* Accueil - Home */}
                <ListItem
                    disablePadding
                    sx={{
                        display: "block",
                        mb: 0.5,
                    }}
                >
                    <ListItemButton
                        component={Link}
                        to="/"
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? "initial" : "center",
                            px: 2.5,
                            py: 1.2,
                            mx: 1,
                            borderRadius: 1.5,
                            backgroundColor: location.pathname === "/"
                                ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                : "inherit",
                            '&:hover': {
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                '& .MuiListItemIcon-root': {
                                    color: 'primary.main',
                                },
                                '& .MuiListItemText-primary': {
                                    color: 'primary.main',
                                }
                            },
                            color: location.pathname === "/"
                                ? 'primary.main'
                                : 'text.primary',
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 2.5 : "auto",
                                justifyContent: "center",
                                color: 'inherit'
                            }}
                        >
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Accueil"
                            sx={{
                                opacity: open ? 1 : 0,
                                '& .MuiListItemText-primary': {
                                    fontWeight: location.pathname === "/" ? 600 : 400,
                                    fontSize: '0.9rem'
                                }
                            }}
                        />
                    </ListItemButton>
                </ListItem>

                {/* Dashboard for MANAGER */}
                {currentUser && currentUser.role === "ROLE_MANAGER" && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            mb: 0.5,
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/dashboard"
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                                py: 1.2,
                                mx: 1,
                                borderRadius: 1.5,
                                backgroundColor: location.pathname === "/dashboard"
                                    ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                    : "inherit",
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                    '& .MuiListItemText-primary': {
                                        color: 'primary.main',
                                    }
                                },
                                color: location.pathname === "/dashboard"
                                    ? 'primary.main'
                                    : 'text.primary',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 2.5 : "auto",
                                    justifyContent: "center",
                                    color: 'inherit'
                                }}
                            >
                                <SpeedIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Tableau de Bord"
                                sx={{
                                    opacity: open ? 1 : 0,
                                    '& .MuiListItemText-primary': {
                                        fontWeight: location.pathname === "/dashboard" ? 600 : 400,
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                )}

                {/* Demandes - Requests Section */}
                {currentUser &&
                    (currentUser.role === "ROLE_FRONTDESK" ||
                        currentUser.role === "ROLE_PROCESSING" ||
                        currentUser.role === "ROLE_MANAGER") && (
                        <>
                            <ListItem
                                disablePadding
                                sx={{
                                    display: "block",
                                    mb: 0.5,
                                }}
                            >
                                <ListItemButton
                                    onClick={handleRequestsClick}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? "initial" : "center",
                                        px: 2.5,
                                        py: 1.2,
                                        mx: 1,
                                        borderRadius: 1.5,
                                        backgroundColor: isRequestsSection
                                            ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                            : "inherit",
                                        '&:hover': {
                                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                        },
                                        color: isRequestsSection
                                            ? 'primary.main'
                                            : 'text.primary',
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 2.5 : "auto",
                                            justifyContent: "center",
                                            color: 'inherit'
                                        }}
                                    >
                                        <AssignmentIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Demandes"
                                        sx={{
                                            opacity: open ? 1 : 0,
                                            '& .MuiListItemText-primary': {
                                                fontWeight: isRequestsSection ? 600 : 400,
                                                fontSize: '0.9rem'
                                            }
                                        }}
                                    />
                                    {open && (requestsOpen ? <ExpandLess /> : <ExpandMore />)}
                                </ListItemButton>
                            </ListItem>
                            {open && (
                                <Collapse in={requestsOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        <ListItemButton
                                            component={Link}
                                            to="/requests"
                                            sx={{
                                                pl: 4,
                                                py: 1,
                                                backgroundColor: location.pathname === "/requests"
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.05)
                                                    : "inherit",
                                                '&:hover': {
                                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                                    '& .MuiListItemIcon-root': {
                                                        color: 'primary.main',
                                                    },
                                                    '& .MuiListItemText-primary': {
                                                        color: 'primary.main',
                                                    }
                                                },
                                                color: location.pathname === "/requests"
                                                    ? 'primary.main'
                                                    : 'text.secondary',
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
                                                <ListIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Liste des demandes"
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        fontSize: '0.85rem'
                                                    }
                                                }}
                                            />
                                        </ListItemButton>
                                        <ListItemButton
                                            component={Link}
                                            to="/create-request"
                                            sx={{
                                                pl: 4,
                                                py: 1,
                                                backgroundColor: location.pathname === "/create-request"
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.05)
                                                    : "inherit",
                                                color: location.pathname === "/create-request"
                                                    ? 'primary.main'
                                                    : 'text.secondary',
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
                                                <AddIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Nouvelle demande"
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        fontSize: '0.85rem'
                                                    }
                                                }}
                                            />
                                        </ListItemButton>
                                    </List>
                                </Collapse>
                            )}
                        </>
                    )
                }

                {/* Attestation Section */}
                {currentUser &&
                    (currentUser.role === "ROLE_FRONTDESK" ||
                        currentUser.role === "ROLE_PROCESSING" ||
                        currentUser.role === "ROLE_MANAGER") && (
                        <>
                            <ListItem
                                disablePadding
                                sx={{
                                    display: "block",
                                    mb: 0.5,
                                }}
                            >
                                <ListItemButton
                                    onClick={handleAttestationClick}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? "initial" : "center",
                                        px: 2.5,
                                        py: 1.2,
                                        mx: 1,
                                        borderRadius: 1.5,
                                        backgroundColor: isAttestationSection
                                            ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                            : "inherit",
                                        '&:hover': {
                                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                        },
                                        color: isAttestationSection
                                            ? 'primary.main'
                                            : 'text.primary',
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 2.5 : "auto",
                                            justifyContent: "center",
                                            color: 'inherit'
                                        }}
                                    >
                                        <ArticleIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Attestations"
                                        sx={{
                                            opacity: open ? 1 : 0,
                                            '& .MuiListItemText-primary': {
                                                fontWeight: isAttestationSection ? 600 : 400,
                                                fontSize: '0.9rem'
                                            }
                                        }}
                                    />
                                    {open && (attestationOpen ? <ExpandLess /> : <ExpandMore />)}
                                </ListItemButton>
                            </ListItem>
                            {open && (
                                <Collapse in={attestationOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        <ListItemButton
                                            component={Link}
                                            to="/attestation-list"
                                            sx={{
                                                pl: 4,
                                                py: 1,
                                                backgroundColor: location.pathname === "/attestation-list"
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.05)
                                                    : "inherit",
                                                '&:hover': {
                                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                                    '& .MuiListItemIcon-root': {
                                                        color: 'primary.main',
                                                    },
                                                    '& .MuiListItemText-primary': {
                                                        color: 'primary.main',
                                                    }
                                                },
                                                color: location.pathname === "/attestation-list"
                                                    ? 'primary.main'
                                                    : 'text.secondary',
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
                                                <ListIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Liste des attestations"
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        fontSize: '0.85rem'
                                                    }
                                                }}
                                            />
                                        </ListItemButton>
                                        {(currentUser?.role === "ROLE_MANAGER" ||
                                            currentUser?.role === "ROLE_PROCESSING" ||
                                            currentUser?.role === "ROLE_FRONTDESK") && (
                                                <ListItemButton
                                                    component={Link}
                                                    to="/create-attestation"
                                                    sx={{
                                                        pl: 4,
                                                        py: 1,
                                                        backgroundColor: location.pathname === "/create-attestation"
                                                            ? (theme) => alpha(theme.palette.primary.main, 0.05)
                                                            : "inherit",
                                                        '&:hover': {
                                                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                                            '& .MuiListItemIcon-root': {
                                                                color: 'primary.main',
                                                            },
                                                            '& .MuiListItemText-primary': {
                                                                color: 'primary.main',
                                                            }
                                                        },
                                                        color: location.pathname === "/create-attestation"
                                                            ? 'primary.main'
                                                            : 'text.secondary',
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
                                                        <AddIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Nouvelle attestation"
                                                        sx={{
                                                            '& .MuiListItemText-primary': {
                                                                fontSize: '0.85rem'
                                                            }
                                                        }}
                                                    />
                                                </ListItemButton>
                                            )}
                                        {currentUser?.role === "ROLE_MANAGER" && (
                                            <ListItemButton
                                                component={Link}
                                                to="/type-attestations"
                                                sx={{
                                                    pl: 4,
                                                    py: 1,
                                                    backgroundColor: location.pathname === "/type-attestations"
                                                        ? (theme) => alpha(theme.palette.primary.main, 0.05)
                                                        : "inherit",
                                                    color: location.pathname === "/type-attestations"
                                                        ? 'primary.main'
                                                        : 'text.secondary',
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
                                                    <CategoryIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Types d'attestation"
                                                    sx={{
                                                        '& .MuiListItemText-primary': {
                                                            fontSize: '0.85rem'
                                                        }
                                                    }}
                                                />
                                            </ListItemButton>
                                        )}
                                    </List>
                                </Collapse>
                            )}
                        </>
                    )
                }

                {/* Admin Section */}
                {currentUser && currentUser.role === "ROLE_ADMIN" && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            mb: 0.5,
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/users"
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? "initial" : "center",
                                px: 2.5,
                                py: 1.2,
                                mx: 1,
                                borderRadius: 1.5,
                                backgroundColor: location.pathname === "/users"
                                    ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                    : "inherit",
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                },
                                color: location.pathname === "/users"
                                    ? 'primary.main'
                                    : 'text.primary',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 2.5 : "auto",
                                    justifyContent: "center",
                                    color: 'inherit'
                                }}
                            >
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Utilisateurs"
                                sx={{
                                    opacity: open ? 1 : 0,
                                    '& .MuiListItemText-primary': {
                                        fontWeight: location.pathname === "/users" ? 600 : 400,
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>

            {open && (
                <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            © {new Date().getFullYear()} BACT System v2.0
                        </Typography>
                    </Box>
                </Box>
            )}
        </Drawer>
    );
}

export default Sidebar; 