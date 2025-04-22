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
    Button
} from "@mui/material";
import {
    ReceiptLong as ReceiptIcon,
    Description as DescriptionIcon,
    AssignmentTurnedIn as CompletedIcon,
    DoNotDisturb as RejectedIcon,
    Pending as PendingIcon,
    Article as NewIcon,
    CalendarMonth as CalendarIcon
} from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import fr from 'date-fns/locale/fr';
import AuthService from "../services/auth.service";
import RequestService from "../services/request.service";
import AttestationService from "../services/attestation.service";

// Import Chart.js for data visualization
// You might need to run: npm install --save react-chartjs-2 chart.js
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

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

    // Chart Data for Requests
    const requestChartData = {
        labels: ['Nouveau', 'En Traitement', 'Traité', 'Rejeté'],
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
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!currentUser || currentUser.role !== "ROLE_MANAGER") {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Vous n'avez pas l'autorisation d'accéder à cette page.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    Tableau de Bord
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
                    Bienvenue sur le tableau de bord de gestion, <strong>{currentUser.username}</strong>.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Time filter controls */}
                <Paper sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: theme.palette.background.default }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 0 } }}>
                                <CalendarIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                <Typography variant="subtitle1" fontWeight="bold">
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
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Card sx={{ height: '100%', backgroundColor: theme.palette.primary.light, borderRadius: 2, boxShadow: 3 }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <ReceiptIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{requestStats.total}</Typography>
                                    <Typography variant="body1">Total Demandes</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Card sx={{ height: '100%', backgroundColor: theme.palette.secondary.light, borderRadius: 2, boxShadow: 3 }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <DescriptionIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mr: 2 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{attestationStats.total}</Typography>
                                    <Typography variant="body1">Total Attestations</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Paper sx={{ mb: 4, borderRadius: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                    >
                        <Tab label="Demandes" />
                        <Tab label="Attestations" />
                        <Tab label="Comparaison" />
                    </Tabs>
                </Paper>

                {/* Tab Content */}
                {activeTab === 0 && (
                    <>
                        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3, fontWeight: 'bold' }}>
                            Statistiques des Demandes
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ height: '100%', bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <NewIcon sx={{ color: '#2196f3', mr: 1 }} />
                                            <Typography variant="h6" sx={{ color: '#2196f3' }}>
                                                Nouveau
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#2196f3' }}>
                                            {requestStats.nouveau}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ height: '100%', bgcolor: '#fff8e1', borderRadius: 2, boxShadow: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <PendingIcon sx={{ color: '#ff9800', mr: 1 }} />
                                            <Typography variant="h6" sx={{ color: '#ff9800' }}>
                                                En Traitement
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#ff9800' }}>
                                            {requestStats.enTraitement}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ height: '100%', bgcolor: '#e8f5e9', borderRadius: 2, boxShadow: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <CompletedIcon sx={{ color: '#4caf50', mr: 1 }} />
                                            <Typography variant="h6" sx={{ color: '#4caf50' }}>
                                                Traité
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#4caf50' }}>
                                            {requestStats.traite}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ height: '100%', bgcolor: '#ffebee', borderRadius: 2, boxShadow: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <RejectedIcon sx={{ color: '#f44336', mr: 1 }} />
                                            <Typography variant="h6" sx={{ color: '#f44336' }}>
                                                Rejeté
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#f44336' }}>
                                            {requestStats.rejete}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Chart for Requests */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Distribution des Demandes
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        <Pie data={requestChartData} />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
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

                {activeTab === 2 && (
                    <>
                        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3, fontWeight: 'bold' }}>
                            Comparaison Demandes vs Attestations
                        </Typography>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            <Box sx={{ height: 400 }}>
                                <Bar data={documentsBarChartData} options={barOptions} />
                            </Box>
                        </Paper>
                    </>
                )}

            </Paper>
        </Container>
    );
}

export default Dashboard; 