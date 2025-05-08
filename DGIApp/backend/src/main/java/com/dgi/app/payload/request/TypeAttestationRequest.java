package com.dgi.app.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TypeAttestationRequest {
    @NotBlank
    @Size(min = 3, max = 255)
    private String label;

    // Getters and Setters
    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}