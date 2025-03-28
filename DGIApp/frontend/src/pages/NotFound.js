import React from "react";
import { Link } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";

function NotFound() {
    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "60vh",
                }}
            >
                <Typography variant="h1" sx={{ mb: 4 }}>
                    404
                </Typography>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Page Not Found
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    The page you are looking for doesn't exist or has been moved.
                </Typography>
                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    color="primary"
                >
                    Return to Home
                </Button>
            </Box>
        </Container>
    );
}

export default NotFound; 