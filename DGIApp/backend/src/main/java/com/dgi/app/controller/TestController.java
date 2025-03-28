package com.dgi.app.controller;

import com.dgi.app.model.ERole;
import com.dgi.app.model.User;
import com.dgi.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @GetMapping("/users-test")
    public ResponseEntity<List<User>> getAllUsersTest() {
        try {
            List<User> users = userRepository.findAll();
            System.out.println("Test endpoint found " + users.size() + " users");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error in test users endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/create-user")
    public ResponseEntity<?> createUserTest(@RequestBody Map<String, String> userRequest) {
        try {
            System.out.println("Test endpoint creating user: " + userRequest.get("username"));

            // Check if user exists
            if (userRepository.existsByUsername(userRequest.get("username"))) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Username is already taken!"));
            }

            if (userRepository.existsByEmail(userRequest.get("email"))) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Email is already in use!"));
            }

            // Get role from request
            String roleStr = userRequest.get("role");
            ERole role;
            try {
                role = ERole.valueOf(roleStr);
            } catch (Exception e) {
                role = ERole.ROLE_FRONTDESK; // Default role
            }

            // Create new user
            User user = new User();
            user.setUsername(userRequest.get("username"));
            user.setEmail(userRequest.get("email"));
            user.setPassword(passwordEncoder.encode(userRequest.get("password")));
            user.setRole(role);

            // Save user
            User savedUser = userRepository.save(user);

            System.out.println("User created successfully with ID: " + savedUser.getId());
            return ResponseEntity.ok(Map.of("message", "User created successfully!"));
        } catch (Exception e) {
            System.err.println("Error creating user in test endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    Map.of("message", "Error creating user: " + e.getMessage()));
        }
    }

    @PostMapping("/update-user/{id}")
    public ResponseEntity<?> updateUserTest(@PathVariable Long id, @RequestBody Map<String, String> userRequest) {
        try {
            System.out.println("Test endpoint updating user with ID: " + id);
            System.out.println("Request payload: " + userRequest);

            // Find the user
            var userData = userRepository.findById(id);
            if (userData.isEmpty()) {
                System.out.println("User with ID " + id + " not found!");
                return ResponseEntity.notFound().build();
            }

            User user = userData.get();
            System.out.println("Found user: " + user.getUsername() + " with role: " + user.getRole());

            // Check if username is changed and already exists
            String newUsername = userRequest.get("username");
            if (newUsername != null && !user.getUsername().equals(newUsername) &&
                    userRepository.existsByUsername(newUsername)) {
                System.out.println("Username " + newUsername + " is already taken!");
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Username is already taken!"));
            }

            // Check if email is changed and already exists
            String newEmail = userRequest.get("email");
            if (newEmail != null && !user.getEmail().equals(newEmail) &&
                    userRepository.existsByEmail(newEmail)) {
                System.out.println("Email " + newEmail + " is already in use!");
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Email is already in use!"));
            }

            // Update user fields
            System.out.println("Updating user fields...");
            if (newUsername != null) {
                System.out.println("Changing username from " + user.getUsername() + " to " + newUsername);
                user.setUsername(newUsername);
            }

            if (newEmail != null) {
                System.out.println("Changing email from " + user.getEmail() + " to " + newEmail);
                user.setEmail(newEmail);
            }

            // Only update password if it's provided
            String newPassword = userRequest.get("password");
            if (newPassword != null && !newPassword.isEmpty()) {
                System.out.println("Updating password (encrypted)");
                user.setPassword(passwordEncoder.encode(newPassword));
            }

            // Update role if provided
            String roleStr = userRequest.get("role");
            if (roleStr != null) {
                System.out.println("Trying to set role to: " + roleStr);
                ERole role;
                try {
                    role = ERole.valueOf(roleStr);
                    System.out.println("Role parsed successfully as enum: " + role);
                } catch (Exception e) {
                    System.out.println("Could not parse role directly, trying to map from frontend format");
                    // If role string doesn't match exactly, try to map from frontend format
                    if (roleStr.equalsIgnoreCase("admin")) {
                        role = ERole.ROLE_ADMIN;
                    } else if (roleStr.equalsIgnoreCase("manager")) {
                        role = ERole.ROLE_MANAGER;
                    } else if (roleStr.equalsIgnoreCase("processing")) {
                        role = ERole.ROLE_PROCESSING;
                    } else {
                        role = ERole.ROLE_FRONTDESK;
                    }
                    System.out.println("Mapped role to: " + role);
                }
                user.setRole(role);
            }

            // Save updated user
            User savedUser = userRepository.save(user);
            System.out.println("User updated successfully with ID: " + savedUser.getId() +
                    ", username: " + savedUser.getUsername() +
                    ", role: " + savedUser.getRole());

            return ResponseEntity.ok(Map.of("message", "User updated successfully!"));
        } catch (Exception e) {
            System.err.println("Error updating user in test endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    Map.of("message", "Error updating user: " + e.getMessage()));
        }
    }

    @PostMapping("/update-user")
    @org.springframework.web.bind.annotation.PutMapping("/update-user")
    public ResponseEntity<?> updateUserTestBody(@RequestBody Map<String, Object> userRequest) {
        try {
            Object idObj = userRequest.get("id");
            Long id;

            if (idObj instanceof Integer) {
                id = ((Integer) idObj).longValue();
            } else if (idObj instanceof Long) {
                id = (Long) idObj;
            } else if (idObj instanceof String) {
                id = Long.parseLong((String) idObj);
            } else {
                System.out.println("Invalid ID format in request: " + idObj);
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid ID format"));
            }

            System.out.println("Test endpoint updating user with ID (from body): " + id);
            System.out.println("Request payload: " + userRequest);

            // Find the user
            var userData = userRepository.findById(id);
            if (userData.isEmpty()) {
                System.out.println("User with ID " + id + " not found!");
                return ResponseEntity.notFound().build();
            }

            User user = userData.get();
            System.out.println("Found user: " + user.getUsername() + " with role: " + user.getRole());

            // Check if username is changed and already exists
            String newUsername = (String) userRequest.get("username");
            if (newUsername != null && !user.getUsername().equals(newUsername) &&
                    userRepository.existsByUsername(newUsername)) {
                System.out.println("Username " + newUsername + " is already taken!");
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Username is already taken!"));
            }

            // Check if email is changed and already exists
            String newEmail = (String) userRequest.get("email");
            if (newEmail != null && !user.getEmail().equals(newEmail) &&
                    userRepository.existsByEmail(newEmail)) {
                System.out.println("Email " + newEmail + " is already in use!");
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Email is already in use!"));
            }

            // Update user fields
            System.out.println("Updating user fields...");
            if (newUsername != null) {
                System.out.println("Changing username from " + user.getUsername() + " to " + newUsername);
                user.setUsername(newUsername);
            }

            if (newEmail != null) {
                System.out.println("Changing email from " + user.getEmail() + " to " + newEmail);
                user.setEmail(newEmail);
            }

            // Only update password if it's provided
            String newPassword = (String) userRequest.get("password");
            if (newPassword != null && !newPassword.isEmpty()) {
                System.out.println("Updating password (encrypted)");
                user.setPassword(passwordEncoder.encode(newPassword));
            }

            // Update role if provided
            String roleStr = (String) userRequest.get("role");
            if (roleStr != null) {
                System.out.println("Trying to set role to: " + roleStr);
                ERole role;
                try {
                    role = ERole.valueOf(roleStr);
                    System.out.println("Role parsed successfully as enum: " + role);
                } catch (Exception e) {
                    System.out.println("Could not parse role directly, trying to map from frontend format");
                    // If role string doesn't match exactly, try to map from frontend format
                    if (roleStr.equalsIgnoreCase("admin")) {
                        role = ERole.ROLE_ADMIN;
                    } else if (roleStr.equalsIgnoreCase("manager")) {
                        role = ERole.ROLE_MANAGER;
                    } else if (roleStr.equalsIgnoreCase("processing")) {
                        role = ERole.ROLE_PROCESSING;
                    } else {
                        role = ERole.ROLE_FRONTDESK;
                    }
                    System.out.println("Mapped role to: " + role);
                }
                user.setRole(role);
            }

            // Save updated user
            User savedUser = userRepository.save(user);
            System.out.println("User updated successfully with ID: " + savedUser.getId() +
                    ", username: " + savedUser.getUsername() +
                    ", role: " + savedUser.getRole());

            return ResponseEntity.ok(Map.of("message", "User updated successfully!"));
        } catch (Exception e) {
            System.err.println("Error updating user in test endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    Map.of("message", "Error updating user: " + e.getMessage()));
        }
    }
}