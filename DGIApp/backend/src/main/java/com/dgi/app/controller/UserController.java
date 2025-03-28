package com.dgi.app.controller;

import com.dgi.app.model.ERole;
import com.dgi.app.model.User;
import com.dgi.app.payload.request.SignupRequest;
import com.dgi.app.payload.response.MessageResponse;
import com.dgi.app.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public List<User> getAllUsers() {
        System.out.println("DEBUG: getAllUsers method called");

        // Get authentication details for debugging
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String name = authentication.getName();
            boolean authenticated = authentication.isAuthenticated();
            String authorities = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(", "));

            System.out.println("DEBUG: Current user: " + name);
            System.out.println("DEBUG: Is authenticated: " + authenticated);
            System.out.println("DEBUG: Authorities: " + authorities);
        } else {
            System.out.println("DEBUG: No authentication found in context!");
        }

        try {
            List<User> users = userRepository.findAll();
            System.out.println("DEBUG: Found " + users.size() + " users");
            users.forEach(
                    user -> System.out.println("DEBUG: User: " + user.getUsername() + ", Role: " + user.getRole()));

            // Remove passwords before returning
            users.forEach(user -> user.setPassword("[PROTECTED]"));
            return users;
        } catch (Exception e) {
            System.err.println("ERROR: Exception in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/admin-debug")
    public List<User> getAllUsersDebug() {
        System.out.println("DEBUG: getAllUsersDebug method called - no auth check");

        try {
            List<User> users = userRepository.findAll();
            System.out.println("DEBUG: Found " + users.size() + " users");
            users.forEach(user -> user.setPassword("[PROTECTED]"));
            return users;
        } catch (Exception e) {
            System.err.println("ERROR: Exception in getAllUsersDebug: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        String strRole = signUpRequest.getRole();
        ERole role;

        switch (strRole) {
            case "admin":
                role = ERole.ROLE_ADMIN;
                break;
            case "manager":
                role = ERole.ROLE_MANAGER;
                break;
            case "processing":
                role = ERole.ROLE_PROCESSING;
                break;
            default:
                role = ERole.ROLE_FRONTDESK;
        }

        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User created successfully!"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody SignupRequest signUpRequest) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            // Check if username is changed and already exists
            if (!user.getUsername().equals(signUpRequest.getUsername()) &&
                    userRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Username is already taken!"));
            }

            // Check if email is changed and already exists
            if (!user.getEmail().equals(signUpRequest.getEmail()) &&
                    userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Email is already in use!"));
            }

            user.setUsername(signUpRequest.getUsername());
            user.setEmail(signUpRequest.getEmail());

            // Only update password if it's provided
            if (signUpRequest.getPassword() != null && !signUpRequest.getPassword().isEmpty()) {
                user.setPassword(encoder.encode(signUpRequest.getPassword()));
            }

            // Update role if provided
            if (signUpRequest.getRole() != null) {
                String strRole = signUpRequest.getRole();
                ERole role;

                switch (strRole) {
                    case "admin":
                        role = ERole.ROLE_ADMIN;
                        break;
                    case "manager":
                        role = ERole.ROLE_MANAGER;
                        break;
                    case "processing":
                        role = ERole.ROLE_PROCESSING;
                        break;
                    default:
                        role = ERole.ROLE_FRONTDESK;
                }

                user.setRole(role);
            }

            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}