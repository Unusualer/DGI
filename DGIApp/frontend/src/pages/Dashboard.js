import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert
} from "@mui/material";
import AuthService from "../services/auth.service";
import RequestService from "../services/request.service";

function Dashboard() {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [requestStats, setRequestStats] = useState({
        total: 0,
        nouveau: 0,
        enTraitement: 0,
        traite: 0,
        rejete: 0
    });

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
            fetchRequestStats();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchRequestStats = async () => {
        try {
            // Use getAllRequestsForTracking which is available to all roles
            const response = await RequestService.getAllRequestsForTracking();

            console.log("Fetched requests:", response.data);

            if (response && response.data) {
                const requests = response.data;

                // Calculate statistics
                const stats = {
                    total: requests.length,
                    nouveau: requests.filter(req => req.etat === "NOUVEAU").length,
                    enTraitement: requests.filter(req => req.etat === "EN_TRAITEMENT").length,
                    traite: requests.filter(req => req.etat === "TRAITE").length,
                    rejete: requests.filter(req => req.etat === "REJETE").length
                };

                console.log("Calculated stats:", stats);

                setRequestStats(stats);
            }
        } catch (error) {
            console.error("Error fetching request statistics:", error);
        } finally {
            setLoading(false);
        }
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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Tableau de Bord
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Bienvenue sur le tableau de bord de gestion, {currentUser.username}.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <Card sx={{ height: '100%', bgcolor: '#f5f5f5' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Demandes
                            </Typography>
                            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {requestStats.total}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Nouveau
                            </Typography>
                            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#2196f3' }}>
                                {requestStats.nouveau}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <Card sx={{ height: '100%', bgcolor: '#fff8e1' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                En Traitement
                            </Typography>
                            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#ff9800' }}>
                                {requestStats.enTraitement}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Traité
                            </Typography>
                            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#4caf50' }}>
                                {requestStats.traite}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Rejeté
                            </Typography>
                            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#f44336' }}>
                                {requestStats.rejete}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Dashboard; 