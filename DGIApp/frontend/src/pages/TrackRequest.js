import React from "react";
import { Container, Typography } from "@mui/material";

function TrackRequest() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Track Request
            </Typography>
            <Typography variant="body1">
                This page will allow users to track the status of a request.
            </Typography>
        </Container>
    );
}

export default TrackRequest; 