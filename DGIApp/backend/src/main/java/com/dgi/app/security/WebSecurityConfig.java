package com.dgi.app.security;

import com.dgi.app.security.jwt.AuthEntryPointJwt;
import com.dgi.app.security.jwt.AuthTokenFilter;
import com.dgi.app.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class WebSecurityConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(WebSecurityConfig.class);

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("DEBUG: Configuring security filter chain");

        http.csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Add security headers
                .headers(headers -> {
                    headers.frameOptions(frameOptions -> frameOptions.deny());
                    headers.contentSecurityPolicy(contentSecurityPolicy -> contentSecurityPolicy.policyDirectives(
                            "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'"));
                    headers.xssProtection(xss -> xss.disable());
                    headers.httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000));
                })
                .authorizeHttpRequests(auth -> {
                    System.out.println("DEBUG: Setting request authorization rules");
                    auth.requestMatchers("/api/auth/**").permitAll();
                    auth.requestMatchers("/api/test/**").permitAll();
                    auth.requestMatchers("/api/public/**").permitAll();
                    auth.requestMatchers("/api/requests/download-excel").permitAll();
                    auth.requestMatchers("/api/requests/exportExcel").permitAll();

                    auth.anyRequest().authenticated();
                    System.out.println("DEBUG: Request authorization configuration complete");
                });

        http.authenticationProvider(authenticationProvider());
        System.out.println("DEBUG: Added authentication provider");

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        System.out.println("DEBUG: Added JWT token filter");

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow specific origins based on environment variable, with localhost defaults
        // for development
        String allowedOriginsConfig = System.getenv("CORS_ALLOWED_ORIGINS");
        if (allowedOriginsConfig == null || allowedOriginsConfig.isEmpty()) {
            // Default to both frontend ports for development
            configuration.setAllowedOrigins(Arrays.asList(
                    "http://localhost:3000", // React dev server
                    "http://localhost:8080" // When served through backend
            ));
            logger.info("Using default development CORS configuration");
        } else {
            configuration.setAllowedOrigins(
                    Arrays.asList(allowedOriginsConfig.split(",")));
            logger.info("Using configured CORS allowed origins: {}", allowedOriginsConfig);
        }

        // Limit allowed methods to only necessary ones
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Limit allowed headers to necessary ones
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Auth-Token", "Origin",
                "Accept", "Access-Control-Request-Method", "Access-Control-Request-Headers"));

        configuration.setExposedHeaders(Arrays.asList("X-Auth-Token", "Authorization"));
        configuration.setAllowCredentials(Boolean.TRUE);

        // Set max age for preflight requests
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(@NonNull HttpServletRequest request,
                    @NonNull HttpServletResponse response,
                    @NonNull Object handler)
                    throws Exception {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                    logger.debug("Authentication in MVC interceptor: {}, authorities: {}", auth.getName(),
                            auth.getAuthorities());
                } else {
                    logger.debug("No authentication in MVC interceptor");
                }
                return true;
            }
        });
    }
}