package com.dgi.app.payload.response;

import java.time.LocalDateTime;

public class TypeAttestationResponse {
    private Long id;
    private String label;
    private LocalDateTime createdAt;

    // Constructors
    public TypeAttestationResponse() {
    }

    public TypeAttestationResponse(Long id, String label, LocalDateTime createdAt) {
        this.id = id;
        this.label = label;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}