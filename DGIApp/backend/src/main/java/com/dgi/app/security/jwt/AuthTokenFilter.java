package com.dgi.app.security.jwt;

import java.io.IOException;

import com.dgi.app.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.Authentication;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Log the request URL for debugging
            logger.info("Processing request for URL: {}", request.getRequestURI());
            logger.info("Request method: {}", request.getMethod());

            // Log request headers for debugging
            java.util.Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                if (headerName.equalsIgnoreCase("Authorization")) {
                    String authHeader = request.getHeader(headerName);
                    if (authHeader != null && authHeader.length() > 10) {
                        logger.info("Auth Header present and starts with: {}", authHeader.substring(0, 10) + "...");
                    } else {
                        logger.info("Auth Header present but too short or null");
                    }
                } else {
                    logger.debug("Header: {} = {}", headerName, request.getHeader(headerName));
                }
            }

            String jwt = parseJwt(request);
            if (jwt != null) {
                logger.info("JWT token found in request with length: {}", jwt.length());

                try {
                    boolean isValid = jwtUtils.validateJwtToken(jwt);
                    logger.info("JWT token validation result: {}", isValid);

                    if (isValid) {
                        String username = jwtUtils.getUserNameFromJwtToken(jwt);
                        logger.info("Username extracted from JWT: {}", username);

                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        logger.info("User loaded from DB: {}, has authorities: {}",
                                userDetails.getUsername(),
                                userDetails.getAuthorities());

                        // Before setting authentication
                        Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
                        logger.info("Existing authentication before setting new: {}",
                                existingAuth != null
                                        ? existingAuth.getName() + ", authorities: " + existingAuth.getAuthorities()
                                        : "null");

                        // Create authentication object
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // Store in the security context
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        logger.info("User authenticated successfully: {}", username);

                        // Log additional details about request path and method
                        logger.info("Request path: {}, method: {}", request.getRequestURI(), request.getMethod());

                        // Enhanced logging for authorities
                        userDetails.getAuthorities()
                                .forEach(auth -> logger.info("Authority type: {}, toString: {}, name: {}",
                                        auth.getClass().getName(),
                                        auth.toString(),
                                        auth.getAuthority()));

                        // Show current authorities
                        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
                        if (currentAuth != null) {
                            logger.info("Security context has authorities: {}", currentAuth.getAuthorities());
                        }
                    } else {
                        logger.warn("JWT token was invalid");
                    }
                } catch (Exception e) {
                    logger.error("Error validating JWT token: {}", e.getMessage());
                    e.printStackTrace();
                }
            } else {
                logger.info("No JWT token found in the request");
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
            e.printStackTrace();
        }

        // Log security context before passing to the next filter
        Authentication beforeNextFilter = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Security context before next filter: {}",
                beforeNextFilter != null ? "Name: " + beforeNextFilter.getName() +
                        ", Class: " + beforeNextFilter.getClass().getName() +
                        ", Authorities: " + beforeNextFilter.getAuthorities() : "null");

        filterChain.doFilter(request, response);

        // Log security context after next filter
        Authentication afterNextFilter = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Security context after next filter: {}",
                afterNextFilter != null ? "Name: " + afterNextFilter.getName() +
                        ", Class: " + afterNextFilter.getClass().getName() +
                        ", Authorities: " + afterNextFilter.getAuthorities() : "null");
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        logger.debug("Authorization header: " + (headerAuth != null ? "Present" : "Not present"));

        if (StringUtils.hasText(headerAuth) && headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}