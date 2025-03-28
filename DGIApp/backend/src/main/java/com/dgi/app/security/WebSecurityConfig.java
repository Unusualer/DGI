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
import org.springframework.http.HttpMethod;
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
        System.out.println("DEBUG: Configuring SecurityFilterChain");

        http.cors(cors -> {
            System.out.println("DEBUG: Configured CORS");
            cors.configurationSource(corsConfigurationSource());
        })
                .csrf(csrf -> {
                    System.out.println("DEBUG: CSRF disabled");
                    csrf.disable();
                })
                .exceptionHandling(exception -> {
                    System.out.println("DEBUG: Configured exception handling");
                    exception.authenticationEntryPoint(unauthorizedHandler);
                })
                .sessionManagement(session -> {
                    System.out.println("DEBUG: Session management set to STATELESS");
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                })
                .authorizeHttpRequests(auth -> {
                    System.out.println("DEBUG: Configuring request authorization");
                    auth.requestMatchers("/api/auth/**").permitAll();
                    auth.requestMatchers("/api/test/**").permitAll();
                    auth.requestMatchers("/api/test/update-user").permitAll();
                    auth.requestMatchers("/api/requests/test").permitAll();
                    auth.requestMatchers("/api/requests/role-test").permitAll();
                    auth.requestMatchers("/api/users/admin-debug").permitAll();
                    auth.requestMatchers("/api/auth/profile").authenticated();

                    // Carefully configure user management endpoints with both hasRole and
                    // hasAuthority methods
                    // Handle the case where ROLE_ might be included or not in the authority name
                    auth.requestMatchers(HttpMethod.GET, "/api/users/**")
                            .hasAnyAuthority("ADMIN", "ROLE_ADMIN");
                    auth.requestMatchers(HttpMethod.POST, "/api/users/**")
                            .hasAnyAuthority("ADMIN", "ROLE_ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/api/users/**")
                            .hasAnyAuthority("ADMIN", "ROLE_ADMIN");
                    auth.requestMatchers(HttpMethod.DELETE, "/api/users/**")
                            .hasAnyAuthority("ADMIN", "ROLE_ADMIN");

                    // Manually authorize request endpoints with roles
                    auth.requestMatchers("/api/requests/").hasAnyAuthority("ROLE_FRONTDESK", "ROLE_MANAGER");
                    auth.requestMatchers("/api/requests/debug-create").hasAuthority("ROLE_MANAGER");
                    auth.requestMatchers("/api/requests/manager-only-test").hasAuthority("ROLE_MANAGER");
                    auth.requestMatchers("/api/requests/create-new").hasAnyAuthority("ROLE_FRONTDESK", "ROLE_MANAGER",
                            "ROLE_PROCESSING");

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
        // Allow requests from all origins for debugging
        configuration.setAllowedOrigins(Arrays.asList("*"));
        // Allow all methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        // Allow more headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Auth-Token", "Origin", "Accept", "X-Requested-With",
                "Access-Control-Request-Method", "X-Debug-Info",
                "Access-Control-Request-Headers", "Cache-Control", "Pragma", "Expires"));
        configuration.setExposedHeaders(Arrays.asList("X-Auth-Token", "Authorization"));
        // Allow credentials if needed
        configuration.setAllowCredentials(Boolean.FALSE);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        System.out.println("DEBUG: CORS Configuration initialized with all origins");
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