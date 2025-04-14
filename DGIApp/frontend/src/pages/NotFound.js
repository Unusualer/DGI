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
                    Page Non Trouvée
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </Typography>
                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    color="primary"
                >
                    Retour à l'Accueil
                </Button>
            </Box>
        </Container>
    );
}

export default NotFound; 