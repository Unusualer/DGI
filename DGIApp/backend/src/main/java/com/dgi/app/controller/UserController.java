package com.dgi.app.controller;

import com.dgi.app.model.ERole;
import com.dgi.app.model.User;
import com.dgi.app.payload.request.SignupRequest;
import com.dgi.app.payload.response.MessageResponse;
import com.dgi.app.repository.UserRepository;
import com.dgi.app.repository.RequestRepository;
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

    @Autowired
    private RequestRepository requestRepository;

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
        System.out.println("DEBUG: Requête de suppression d'utilisateur reçue pour l'ID: " + id);
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                System.out.println("DEBUG: Utilisateur trouvé pour suppression: " + user.get().getUsername());

                // Check if this user has any associated requests as agent
                List<com.dgi.app.model.Request> associatedRequests = requestRepository.findByAgent(user.get());
                if (!associatedRequests.isEmpty()) {
                    System.out.println("DEBUG: L'utilisateur est assigné comme agent à " + associatedRequests.size()
                            + " demandes.");
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Cannot delete this user because they are assigned to " +
                                    associatedRequests.size()
                                    + " requests. Please reassign these requests first or use the 'reassign-and-delete' endpoint."));
                }

                // Check if this user has created any requests
                List<com.dgi.app.model.Request> createdRequests = requestRepository.findByCreator(user.get());
                if (!createdRequests.isEmpty()) {
                    System.out.println("DEBUG: L'utilisateur a créé " + createdRequests.size() + " demandes.");
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Cannot delete this user because they have created " +
                                    createdRequests.size()
                                    + " requests. Please use the 'reassign-and-delete' endpoint."));
                }

                userRepository.deleteById(id);
                System.out.println("DEBUG: Utilisateur supprimé avec succès");
                return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
            } else {
                System.out.println("DEBUG: Aucun utilisateur trouvé pour l'ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("ERROR: Exception lors de la suppression de l'utilisateur: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Error deleting user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/reassign-and-delete/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> reassignAndDeleteUser(@PathVariable Long id, @RequestParam Long reassignToUserId) {
        System.out.println("DEBUG: Requête de réassignation et suppression d'utilisateur reçue pour l'ID: " + id);

        try {
            // Check if both users exist
            Optional<User> userToDelete = userRepository.findById(id);
            Optional<User> reassignToUser = userRepository.findById(reassignToUserId);

            if (!userToDelete.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("User to delete not found with id: " + id));
            }

            if (!reassignToUser.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Reassignment user not found with id: " + reassignToUserId));
            }

            User deleteUser = userToDelete.get();
            User targetUser = reassignToUser.get();

            System.out.println("DEBUG: Réassignation des demandes de " + deleteUser.getUsername() +
                    " à " + targetUser.getUsername());

            // Get all requests where the user to be deleted is the agent
            List<com.dgi.app.model.Request> agentRequests = requestRepository.findByAgent(deleteUser);
            for (com.dgi.app.model.Request request : agentRequests) {
                request.setAgent(targetUser);
                System.out.println("DEBUG: Réassignation de la demande " + request.getId() +
                        " de l'agent " + deleteUser.getUsername() + " à " + targetUser.getUsername());
            }

            // Get all requests where the user to be deleted is the creator
            List<com.dgi.app.model.Request> createdRequests = requestRepository.findByCreator(deleteUser);
            for (com.dgi.app.model.Request request : createdRequests) {
                request.setCreator(targetUser);
                System.out.println("DEBUG: Réassignation de la demande créée " + request.getId() +
                        " du créateur " + deleteUser.getUsername() + " à " + targetUser.getUsername());
            }

            // Save all updated requests
            if (!agentRequests.isEmpty() || !createdRequests.isEmpty()) {
                requestRepository.saveAll(agentRequests);
                requestRepository.saveAll(createdRequests);
                System.out.println("DEBUG: Toutes les demandes ont été réassignées avec succès");
            } else {
                System.out.println("DEBUG: Aucune demande à réassigner");
            }

            // Now delete the user
            userRepository.delete(deleteUser);
            System.out.println("DEBUG: Utilisateur supprimé avec succès après réassignation");

            return ResponseEntity.ok(new MessageResponse("User deleted successfully after reassigning " +
                    (agentRequests.size() + createdRequests.size()) + " requests to user " +
                    targetUser.getUsername()));

        } catch (Exception e) {
            System.err.println("ERROR: Exception lors de la réassignation et suppression: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Error during reassignment and deletion: " + e.getMessage()));
        }
    }
}