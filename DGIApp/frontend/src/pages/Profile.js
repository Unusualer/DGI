import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Avatar,
    Divider,
    Card,
    CardContent,
    Grid,
    Alert,
    CircularProgress,
    Button,
    TextField,
    Snackbar
} from "@mui/material";
import { Person as PersonIcon, Refresh as RefreshIcon, Save as SaveIcon } from "@mui/icons-material";
import AuthService from "../services/auth.service";

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await AuthService.getProfile();
            setProfileData(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching profile data:", err);
            setError("Network Error: Unable to load profile information");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
        validatePasswords(e.target.value, confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        validatePasswords(newPassword, e.target.value);
    };

    const validatePasswords = (password, confirmPwd) => {
        let isValid = true;

        // Reset both error states first
        setPasswordError("");
        setConfirmPasswordError("");

        if (!password && !confirmPwd) {
            return true;
        }

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            isValid = false;
        }

        if (password !== confirmPwd && confirmPwd) {
            setConfirmPasswordError("Passwords do not match");
            isValid = false;
        }

        return isValid;
    };

    const handleSavePassword = async () => {
        if (!validatePasswords(newPassword, confirmPassword)) {
            return;
        }

        if (!newPassword) {
            setSuccessMessage("No changes to save");
            setShowSuccess(true);
            return;
        }

        try {
            // Call the API to update the password
            await AuthService.changePassword(newPassword);

            setSuccessMessage("Password updated successfully");
            setShowSuccess(true);
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Error updating password:", err);
            setPasswordError("Failed to update password: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading profile...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Box textAlign="center">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={fetchProfileData}
                        sx={{ mt: 2 }}
                    >
                        Retry
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                User Profile
            </Typography>

            {profileData && (
                <>
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mr: 3 }}>
                                    <PersonIcon sx={{ fontSize: 50 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5">{profileData.username}</Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {profileData.role.replace('ROLE_', '')}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1">{profileData.email}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Change Password
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        type="password"
                                        variant="outlined"
                                        value={newPassword}
                                        onChange={handlePasswordChange}
                                        margin="normal"
                                        error={!!passwordError}
                                        helperText={passwordError}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        type="password"
                                        variant="outlined"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        margin="normal"
                                        error={!!confirmPasswordError}
                                        helperText={confirmPasswordError}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<SaveIcon />}
                                            onClick={handleSavePassword}
                                            disabled={!!passwordError || !!confirmPasswordError}
                                        >
                                            Save Changes
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </>
            )}

            <Snackbar
                open={showSuccess}
                autoHideDuration={6000}
                onClose={handleCloseSuccess}
                message={successMessage}
            />
        </Container>
    );
}

export default Profile; 