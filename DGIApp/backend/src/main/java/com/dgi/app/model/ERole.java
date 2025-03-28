package com.dgi.app.model;

public enum ERole {
    ROLE_FRONTDESK, // Create and track requests only
    ROLE_PROCESSING, // Create, track and update requests
    ROLE_MANAGER, // Create, track and update requests + dashboard
    ROLE_ADMIN // CRUD user and their roles
}