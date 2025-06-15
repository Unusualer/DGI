import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Paper,
    Tab,
    Tabs,
    Divider,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Avatar,
    IconButton,
    Tooltip,
    CardHeader,
    Stack,
    Chip
} from "@mui/material";
import {
    ReceiptLong as ReceiptIcon,
    Description as DescriptionIcon,
    AssignmentTurnedIn as CompletedIcon,
    DoNotDisturb as RejectedIcon,
    Pending as PendingIcon,
    Article as NewIcon,
    CalendarMonth as CalendarIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    MoreVert as MoreVertIcon,
    Autorenew as AutorenewIcon,
    FileDownload as FileDownloadIcon
} from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import fr from 'date-fns/locale/fr';
import AuthService from "../services/auth.service";
import RequestService from "../services/request.service";
import AttestationService from "../services/attestation.service";
import { alpha } from '@mui/material/styles';

// Import Chart.js for data visualization
// You might need to run: npm install --save react-chartjs-2 chart.js
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    ChartTooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement
);

// Dashboard stat card component
function StatCard({ icon, title, value, secondaryValue, secondaryLabel, trend, color, sx }) {
    const IconComponent = icon;

    return (
        <Card
            sx={{
                height: '100%',
                boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 4px',
                borderRadius: 2,
                ...sx
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Avatar
                            sx={{
                                bgcolor: alpha(color, 0.15),
                                color: color,
                                width: 56,
                                height: 56,
                            }}
                        >
                            <IconComponent />
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight={600} mb={1}>
                            {value}
                        </Typography>
                        {secondaryValue && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip
                                    size="small"
                                    icon={trend === 'up' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                                    label={secondaryValue}
                                    color={trend === 'up' ? 'success' : 'error'}
                                    variant="outlined"
                                    sx={{ mr: 1, height: 22 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {secondaryLabel}
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

function Dashboard() {
    const theme = useTheme();
    const [currentUser, setCurrentUser] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [requestStats, setRequestStats] = useState({
        total: 0,
        nouveau: 0,
        enTraitement: 0,
        traite: 0,
        rejete: 0
    });
    const [attestationStats, setAttestationStats] = useState({
        total: 0,
        déposé: 0,
        livré: 0,
        byType: {}
    });
    const [previousMonthStats, setPreviousMonthStats] = useState({
        requests: 0,
        attestations: 0
    });

    // Time filter states
    const [timeFilter, setTimeFilter] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
            fetchRequestStats();
            fetchAttestationStats();
        } else {
            setLoading(false);
        }
    }, []);

    // Re-fetch data when time filter changes
    useEffect(() => {
        if (currentUser) {
            fetchRequestStats();
            fetchAttestationStats();
        }
    }, [timeFilter, startDate, endDate, selectedMonth, selectedYear]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleTimeFilterChange = (event) => {
        const value = event.target.value;
        setTimeFilter(value);

        // Reset custom date range when selecting a predefined filter
        if (value !== "custom") {
            setShowCustomDatePicker(false);
        } else {
            setShowCustomDatePicker(true);
        }

        // Show/hide month picker
        if (value === "by_month") {
            setShowMonthPicker(true);
        } else {
            setShowMonthPicker(false);
        }
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value));
    };

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
    };

    // Set start and end dates based on selected time filter
    const getFilterDates = () => {
        const now = new Date();
        let filterStartDate = null;
        let filterEndDate = new Date(now);

        switch (timeFilter) {
            case "today":
                // Start of today
                filterStartDate = new Date(now);
                filterStartDate.setHours(0, 0, 0, 0);
                break;
            case "this_month":
                // Start of current month
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "last_30_days":
                // 30 days ago
                filterStartDate = new Date(now);
                filterStartDate.setDate(now.getDate() - 30);
                break;
            case "last_7_days":
                // 7 days ago
                filterStartDate = new Date(now);
                filterStartDate.setDate(now.getDate() - 7);
                break;
            case "by_month":
                // First day of selected month
                filterStartDate = new Date(selectedYear, selectedMonth, 1);
                // Last day of selected month
                filterEndDate = new Date(selectedYear, parseInt(selectedMonth) + 1, 0, 23, 59, 59, 999);
                break;
            case "custom":
                // Use custom date range if both dates are set
                if (startDate && endDate) {
                    filterStartDate = new Date(startDate);
                    filterEndDate = new Date(endDate);
                    filterEndDate.setHours(23, 59, 59, 999);
                }
                break;
            default:
                // "all" or any other value - no date filtering
                return { startDate: null, endDate: null };
        }

        if (filterStartDate) {
            filterStartDate.setHours(0, 0, 0, 0);
        }

        return { startDate: filterStartDate, endDate: filterEndDate };
    };

    const fetchRequestStats = async () => {
        try {
            const response = await RequestService.getAllRequestsForTracking();

            if (response && response.data) {
                const { startDate: filterStart, endDate: filterEnd } = getFilterDates();

                // Filter requests by date if time filter is active
                let filteredRequests = response.data;
                if (filterStart && filterEnd) {
                    filteredRequests = response.data.filter(req => {
                        const reqDate = new Date(req.createdAt);
                        return reqDate >= filterStart && reqDate <= filterEnd;
                    });
                }

                // Calculate previous month's stats
                const now = new Date();
                const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

                const previousMonthRequests = response.data.filter(req => {
                    const reqDate = new Date(req.createdAt);
                    return reqDate >= previousMonthStart && reqDate <= previousMonthEnd;
                });

                setPreviousMonthStats(prev => ({
                    ...prev,
                    requests: previousMonthRequests.length
                }));

                const stats = {
                    total: filteredRequests.length,
                    nouveau: filteredRequests.filter(req => req.etat === "NOUVEAU").length,
                    enTraitement: filteredRequests.filter(req => req.etat === "EN_TRAITEMENT").length,
                    traite: filteredRequests.filter(req => req.etat === "TRAITE").length,
                    rejete: filteredRequests.filter(req => req.etat === "REJETE").length
                };

                setRequestStats(stats);
            }
        } catch (error) {
            console.error("Error fetching request statistics:", error);
        }
    };

    const fetchAttestationStats = async () => {
        try {
            const response = await AttestationService.getAllAttestationsForTracking();

            if (response) {
                const { startDate: filterStart, endDate: filterEnd } = getFilterDates();

                // Filter attestations by date if time filter is active
                let filteredAttestations = response;
                if (filterStart && filterEnd) {
                    filteredAttestations = response.filter(att => {
                        const attDate = new Date(att.createdAt);
                        return attDate >= filterStart && attDate <= filterEnd;
                    });
                }

                // Calculate previous month's stats
                const now = new Date();
                const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

                const previousMonthAttestations = response.filter(att => {
                    const attDate = new Date(att.createdAt);
                    return attDate >= previousMonthStart && attDate <= previousMonthEnd;
                });

                setPreviousMonthStats(prev => ({
                    ...prev,
                    attestations: previousMonthAttestations.length
                }));

                // Count by status
                const deposé = filteredAttestations.filter(att => att.status === "déposé").length;
                const livré = filteredAttestations.filter(att => att.status === "livré").length;

                // Count by type
                const typeCount = {};
                filteredAttestations.forEach(att => {
                    const type = att.type;
                    if (!typeCount[type]) {
                        typeCount[type] = 0;
                    }
                    typeCount[type]++;
                });

                setAttestationStats({
                    total: filteredAttestations.length,
                    déposé: deposé,
                    livré: livré,
                    byType: typeCount
                });
            }
        } catch (error) {
            console.error("Error fetching attestation statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate percentage change
    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? "+100%" : "0%";
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
    };

    // Chart Data for Requests
    const requestChartData = {
        labels: [
            `Nouveau (${requestStats.total > 0 ? Math.round((requestStats.nouveau / requestStats.total) * 100) : 0}%)`,
            `En Traitement (${requestStats.total > 0 ? Math.round((requestStats.enTraitement / requestStats.total) * 100) : 0}%)`,
            `Traité (${requestStats.total > 0 ? Math.round((requestStats.traite / requestStats.total) * 100) : 0}%)`,
            `Rejeté (${requestStats.total > 0 ? Math.round((requestStats.rejete / requestStats.total) * 100) : 0}%)`
        ],
        datasets: [
            {
                label: 'Demandes par statut',
                data: [
                    requestStats.nouveau,
                    requestStats.enTraitement,
                    requestStats.traite,
                    requestStats.rejete
                ],
                backgroundColor: [
                    '#2196f3',  // blue
                    '#ff9800',  // orange
                    '#4caf50',  // green
                    '#f44336',  // red
                ],
                borderWidth: 1,
            },
        ],
    };

    // Add chart options for better percentage display
    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Chart Data for Attestations by Status
    const attestationStatusChartData = {
        labels: ['Déposé', 'Livré'],
        datasets: [
            {
                label: 'Attestations par statut',
                data: [attestationStats.déposé, attestationStats.livré],
                backgroundColor: [
                    '#9c27b0',  // purple
                    '#009688',  // teal
                ],
                borderWidth: 1,
            },
        ],
    };

    // Chart Data for Attestations by Type
    const typeLabels = Object.keys(attestationStats.byType).map(type => {
        switch (type) {
            case 'revenu_globale': return 'Revenu Globale';
            case 'tva_logement_social': return 'TVA Logement Social';
            case 'renseignement_deces': return 'Renseignement Décès';
            case 'depart_definitif': return 'Départ Définitif';
            default: return type;
        }
    });

    const typeValues = Object.values(attestationStats.byType);

    const attestationTypeChartData = {
        labels: typeLabels,
        datasets: [
            {
                label: 'Attestations par type',
                data: typeValues,
                backgroundColor: [
                    '#e91e63',  // pink
                    '#9c27b0',  // purple
                    '#673ab7',  // deep purple
                    '#3f51b5',  // indigo
                ],
                borderWidth: 1,
            },
        ],
    };

    // Bar chart data for all documents
    const documentsBarChartData = {
        labels: ['Demandes', 'Attestations'],
        datasets: [
            {
                label: 'Total',
                data: [requestStats.total, attestationStats.total],
                backgroundColor: [theme.palette.primary.main, theme.palette.secondary.main],
                borderWidth: 1,
            },
            {
                label: 'Complétés',
                data: [requestStats.traite, attestationStats.livré],
                backgroundColor: [theme.palette.success.light, theme.palette.success.main],
                borderWidth: 1,
            }
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Demandes vs Attestations',
            },
        },
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        minHeight: "50vh",
                        mt: 4
                    }}
                >
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                        Chargement des données...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (!currentUser || currentUser.role !== "ROLE_MANAGER") {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert
                    severity="error"
                    sx={{
                        borderRadius: 2,
                        py: 2,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={500}>
                        Vous n'avez pas l'autorisation d'accéder à cette page.
                    </Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Tableau de Bord
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Bienvenue sur le tableau de bord de gestion, <strong>{currentUser.username}</strong>.
                    Visualisez et analysez les statistiques du système.
                </Typography>
            </Box>

            {/* Time filter controls */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.primary.light, 0.08),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 0 } }}>
                            <Avatar
                                sx={{
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                                    color: 'primary.main',
                                    width: 36,
                                    height: 36,
                                    mr: 1.5
                                }}
                            >
                                <CalendarIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Filtre par période
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Période</InputLabel>
                            <Select
                                value={timeFilter}
                                label="Période"
                                onChange={handleTimeFilterChange}
                            >
                                <MenuItem value="all">Toutes les données</MenuItem>
                                <MenuItem value="today">Aujourd'hui</MenuItem>
                                <MenuItem value="this_month">Ce mois-ci</MenuItem>
                                <MenuItem value="last_30_days">Derniers 30 jours</MenuItem>
                                <MenuItem value="last_7_days">Derniers 7 jours</MenuItem>
                                <MenuItem value="by_month">Par mois</MenuItem>
                                <MenuItem value="custom">Période personnalisée</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {showMonthPicker && (
                        <>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Mois</InputLabel>
                                    <Select
                                        value={selectedMonth}
                                        label="Mois"
                                        onChange={handleMonthChange}
                                    >
                                        <MenuItem value={0}>Janvier</MenuItem>
                                        <MenuItem value={1}>Février</MenuItem>
                                        <MenuItem value={2}>Mars</MenuItem>
                                        <MenuItem value={3}>Avril</MenuItem>
                                        <MenuItem value={4}>Mai</MenuItem>
                                        <MenuItem value={5}>Juin</MenuItem>
                                        <MenuItem value={6}>Juillet</MenuItem>
                                        <MenuItem value={7}>Août</MenuItem>
                                        <MenuItem value={8}>Septembre</MenuItem>
                                        <MenuItem value={9}>Octobre</MenuItem>
                                        <MenuItem value={10}>Novembre</MenuItem>
                                        <MenuItem value={11}>Décembre</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Année</InputLabel>
                                    <Select
                                        value={selectedYear}
                                        label="Année"
                                        onChange={handleYearChange}
                                    >
                                        <MenuItem value={2022}>2022</MenuItem>
                                        <MenuItem value={2023}>2023</MenuItem>
                                        <MenuItem value={2024}>2024</MenuItem>
                                        <MenuItem value={2025}>2025</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </>
                    )}

                    {showCustomDatePicker && (
                        <>
                            <Grid item xs={12} sm={6} md={3}>
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                                    <DatePicker
                                        label="Date début"
                                        value={startDate}
                                        onChange={setStartDate}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                                    <DatePicker
                                        label="Date fin"
                                        value={endDate}
                                        onChange={setEndDate}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={ReceiptIcon}
                        title="Total Demandes"
                        value={requestStats.total}
                        secondaryValue={calculatePercentageChange(requestStats.total, previousMonthStats.requests)}
                        secondaryLabel="vs mois dernier"
                        trend={requestStats.total > previousMonthStats.requests ? "up" : "down"}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={DescriptionIcon}
                        title="Total Attestations"
                        value={attestationStats.total}
                        secondaryValue={calculatePercentageChange(attestationStats.total, previousMonthStats.attestations)}
                        secondaryLabel="vs mois dernier"
                        trend={attestationStats.total > previousMonthStats.attestations ? "up" : "down"}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={CompletedIcon}
                        title="Demandes Traitées"
                        value={requestStats.traite}
                        secondaryValue={(requestStats.total > 0 ? Math.round((requestStats.traite / requestStats.total) * 100) : 0) + "%"}
                        secondaryLabel="taux de traitement"
                        trend="up"
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={NewIcon}
                        title="Demandes Nouvelles"
                        value={requestStats.nouveau}
                        secondaryValue={(requestStats.total > 0 ? Math.round((requestStats.nouveau / requestStats.total) * 100) : 0) + "%"}
                        secondaryLabel="du total"
                        trend={requestStats.nouveau > 5 ? "up" : "down"}
                        color={theme.palette.info.main}
                    />
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            py: 1.5
                        }
                    }}
                >
                    <Tab label="Demandes" />
                    <Tab label="Attestations" />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            {activeTab === 0 && (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Demandes par statut
                                </Typography>
                                <IconButton size="small">
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Pie data={requestChartData} options={pieOptions} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Répartition des statuts
                                </Typography>
                            </Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, bgcolor: alpha('#2196f3', 0.15), borderRadius: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Nouveau
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} color="primary">
                                            {requestStats.nouveau}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, bgcolor: alpha('#ff9800', 0.15), borderRadius: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            En Traitement
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} color="#d68100">
                                            {requestStats.enTraitement}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, bgcolor: alpha('#4caf50', 0.15), borderRadius: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Traité
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} color="success.main">
                                            {requestStats.traite}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, bgcolor: alpha('#f44336', 0.15), borderRadius: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Rejeté
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} color="error.main">
                                            {requestStats.rejete}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3, fontWeight: 'bold' }}>
                        Statistiques des Attestations
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ height: '100%', bgcolor: '#f3e5f5', borderRadius: 2, boxShadow: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PendingIcon sx={{ color: '#9c27b0', mr: 1 }} />
                                        <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                                            Déposé
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#9c27b0' }}>
                                        {attestationStats.déposé}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ height: '100%', bgcolor: '#e0f2f1', borderRadius: 2, boxShadow: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <CompletedIcon sx={{ color: '#009688', mr: 1 }} />
                                        <Typography variant="h6" sx={{ color: '#009688' }}>
                                            Livré
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#009688' }}>
                                        {attestationStats.livré}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Charts for Attestations */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Attestations par Statut
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <Pie data={attestationStatusChartData} />
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Attestations par Type
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <Pie data={attestationTypeChartData} />
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}

        </Container>
    );
}

export default Dashboard; 