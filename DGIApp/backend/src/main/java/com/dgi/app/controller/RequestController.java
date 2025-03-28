package com.dgi.app.controller;

import com.dgi.app.model.Request;
import com.dgi.app.model.User;
import com.dgi.app.payload.request.RequestCreateRequest;
import com.dgi.app.payload.request.RequestUpdateRequest;
import com.dgi.app.payload.response.MessageResponse;
import com.dgi.app.payload.response.RequestResponse;
import com.dgi.app.repository.RequestRepository;
import com.dgi.app.repository.UserRepository;
import com.dgi.app.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;

@CrossOrigin(origins = "*", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.DELETE })
@RestController
@RequestMapping("/api/requests")
public class RequestController {
    @Autowired
    RequestRepository requestRepository;

    @Autowired
    UserRepository userRepository;

    // Helper to get current authenticated user
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                throw new RuntimeException("No authentication found in SecurityContext");
            }

            if (authentication.getPrincipal() == null) {
                throw new RuntimeException("No principal found in Authentication");
            }

            if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                throw new RuntimeException("Principal is not of expected type: " +
                        authentication.getPrincipal().getClass().getName());
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            return userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));
        } catch (Exception e) {
            // Log the error
            System.err.println("Error getting current user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Convert Request entity to RequestResponse DTO
    private RequestResponse convertToDTO(Request request) {
        RequestResponse dto = new RequestResponse();
        dto.setId(request.getId());
        dto.setDateEntree(request.getDateEntree());
        dto.setRaisonSocialeNomsPrenom(request.getRaisonSocialeNomsPrenom());
        dto.setCin(request.getCin());
        dto.setPmPp(request.getPmPp());
        dto.setObjet(request.getObjet());
        dto.setDateTraitement(request.getDateTraitement());
        dto.setEtat(request.getEtat());
        dto.setIfValue(request.getIfValue());
        dto.setIce(request.getIce());
        dto.setSecteur(request.getSecteur());
        dto.setMotifRejet(request.getMotifRejet());
        dto.setTp(request.getTp());
        dto.setEmail(request.getEmail());
        dto.setGsm(request.getGsm());
        dto.setFix(request.getFix());
        dto.setRemarque(request.getRemarque());

        if (request.getAgent() != null) {
            dto.setAgentId(request.getAgent().getId());
            dto.setAgentUsername(request.getAgent().getUsername());
        }

        if (request.getCreator() != null) {
            dto.setCreatorId(request.getCreator().getId());
            dto.setCreatorUsername(request.getCreator().getUsername());
        }

        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        return dto;
    }

    // Create a new request - by FRONTDESK or MANAGER
    @PostMapping
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<?> createRequest(@Valid @RequestBody RequestCreateRequest createRequest) {
        try {
            // Debug security context information
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String debugInfo = "Auth details: " +
                    "name=" + authentication.getName() + ", " +
                    "principal=" + authentication.getPrincipal() + ", " +
                    "authorities=" + authentication.getAuthorities() + ", " +
                    "authenticated=" + authentication.isAuthenticated() + ", " +
                    "details=" + authentication.getDetails();
            System.out.println("DEBUG: " + debugInfo);

            // Print authentication class to help debug
            System.out.println("DEBUG: Authentication class: " + authentication.getClass().getName());
            System.out.println("DEBUG: Principal class: " +
                    (authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName()
                            : "null"));

            // Force log all authorities and check explicitly if the user has required roles
            System.out.println("DEBUG: Checking if user has ROLE_FRONTDESK or ROLE_MANAGER...");
            boolean hasFrontdeskRole = authentication.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .anyMatch(r -> r.equals("ROLE_FRONTDESK"));
            boolean hasManagerRole = authentication.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .anyMatch(r -> r.equals("ROLE_MANAGER"));
            System.out.println("DEBUG: hasFrontdeskRole=" + hasFrontdeskRole + ", hasManagerRole=" + hasManagerRole);

            // List all individual authorities for clarity
            authentication.getAuthorities()
                    .forEach(auth -> System.out.println("DEBUG: Authority: '" + auth.getAuthority() + "'"));

            if (authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                System.out.println("DEBUG: User details - ID: " + userDetails.getId() +
                        ", Username: " + userDetails.getUsername() +
                        ", Roles: " + userDetails.getAuthorities());
            } else {
                System.out.println("DEBUG: Principal is not UserDetailsImpl, it is: " +
                        (authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName()
                                : "null"));
            }

            // Try to get the user - simplified approach like in the debug version
            User currentUser = getCurrentUser();
            System.out.println("DEBUG: Successfully got current user: " + currentUser.getUsername());

            Request request = new Request();
            request.setDateEntree(createRequest.getDateEntree());
            request.setRaisonSocialeNomsPrenom(createRequest.getRaisonSocialeNomsPrenom());
            request.setCin(createRequest.getCin());
            request.setPmPp(createRequest.getPmPp());
            request.setObjet(createRequest.getObjet());
            request.setCreator(currentUser);
            request.setEtat("NOUVEAU"); // Default state

            Request savedRequest = requestRepository.save(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedRequest));
        } catch (Exception e) {
            System.err.println("Error creating request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating request: " + e.getMessage()));
        }
    }

    // Update a request - by PROCESSING or MANAGER
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROCESSING') or hasRole('MANAGER')")
    public ResponseEntity<?> updateRequest(@PathVariable Long id,
            @Valid @RequestBody RequestUpdateRequest updateRequest) {
        User currentUser = getCurrentUser();
        Optional<Request> requestData = requestRepository.findById(id);

        if (requestData.isPresent()) {
            Request request = requestData.get();

            // Update with processing information
            request.setDateTraitement(updateRequest.getDateTraitement());
            request.setEtat(updateRequest.getEtat());
            request.setIfValue(updateRequest.getIfValue());
            request.setSecteur(updateRequest.getSecteur());
            request.setMotifRejet(updateRequest.getMotifRejet());
            request.setTp(updateRequest.getTp());
            request.setEmail(updateRequest.getEmail());
            request.setGsm(updateRequest.getGsm());
            request.setFix(updateRequest.getFix());
            request.setRemarque(updateRequest.getRemarque());

            // Set the processing agent
            request.setAgent(currentUser);
            request.setUpdatedAt(LocalDateTime.now());

            requestRepository.save(request);
            return ResponseEntity.ok(convertToDTO(request));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all requests for MANAGER
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> getAllRequests() {
        List<Request> requests = requestRepository.findAll();
        List<RequestResponse> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get requests created by current FRONTDESK agent
    @GetMapping("/my-submissions")
    @PreAuthorize("hasRole('FRONTDESK')")
    public ResponseEntity<?> getMySubmissions() {
        User currentUser = getCurrentUser();
        List<Request> requests = requestRepository.findByCreator(currentUser);
        List<RequestResponse> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get requests processed by current PROCESSING agent
    @GetMapping("/my-processed")
    @PreAuthorize("hasRole('PROCESSING') or hasRole('MANAGER')")
    public ResponseEntity<?> getMyProcessedRequests() {
        User currentUser = getCurrentUser();
        List<Request> requests = requestRepository.findByAgent(currentUser);
        List<RequestResponse> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get all requests for tracking - available to all roles
    @GetMapping("/track")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('PROCESSING') or hasRole('MANAGER')")
    public ResponseEntity<?> getAllRequestsForTracking() {
        List<Request> requests = requestRepository.findAll();
        List<RequestResponse> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get requests by state
    @GetMapping("/state/{state}")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('PROCESSING') or hasRole('MANAGER')")
    public ResponseEntity<?> getRequestsByState(@PathVariable String state) {
        List<Request> requests = requestRepository.findByEtat(state);
        List<RequestResponse> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Search requests by name/company name
    @GetMapping("/search/name")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('PROCESSING') or hasRole('MANAGER')")
    public ResponseEntity<?> searchRequestsByName(@RequestParam String query) {
        List<Request> requests = requestRepository.findByRaisonSocialeNomsPrenomContainingIgnoreCase(query);
        List<RequestResponse> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Search requests by CIN
    @GetMapping("/search/cin")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('PROCESSING') or hasRole('MANAGER')")
    public ResponseEntity<?> searchRequestsByCin(@RequestParam String query) {
        List<Request> requests = requestRepository.findByCinContainingIgnoreCase(query);
        List<RequestResponse> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get a single request by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('PROCESSING') or hasRole('MANAGER')")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        Optional<Request> request = requestRepository.findById(id);
        if (request.isPresent()) {
            return ResponseEntity.ok(convertToDTO(request.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a request - MANAGER only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        Optional<Request> request = requestRepository.findById(id);
        if (request.isPresent()) {
            requestRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Request deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Test endpoint - no authorization required
    @PostMapping("/test")
    public ResponseEntity<?> testCreateRequest(@Valid @RequestBody RequestCreateRequest createRequest) {
        try {
            // Get any user for testing
            User testUser = userRepository.findAll()
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (testUser == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new MessageResponse("No users found in database"));
            }

            System.out.println("Using test user: " + testUser.getUsername() + " with role: " + testUser.getRole());

            Request request = new Request();
            request.setDateEntree(createRequest.getDateEntree());
            request.setRaisonSocialeNomsPrenom(createRequest.getRaisonSocialeNomsPrenom());
            request.setCin(createRequest.getCin());
            request.setPmPp(createRequest.getPmPp());
            request.setObjet(createRequest.getObjet());
            request.setCreator(testUser);
            request.setEtat("NOUVEAU"); // Default state

            Request savedRequest = requestRepository.save(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedRequest));
        } catch (Exception e) {
            System.err.println("Error in test endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating test request: " + e.getMessage()));
        }
    }

    // Add a test endpoint for role debugging only
    @GetMapping("/role-test")
    public ResponseEntity<?> roleTest() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
            String name = authentication != null ? authentication.getName() : "none";
            String principal = authentication != null
                    ? (authentication.getPrincipal() != null ? authentication.getPrincipal().toString() : "null")
                    : "none";
            String authorities = authentication != null ? authentication.getAuthorities().toString() : "none";

            return ResponseEntity.ok(Map.of(
                    "authenticated", isAuthenticated,
                    "name", name,
                    "principal", principal,
                    "authorities", authorities));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Add a test endpoint for role debugging with manager role
    @GetMapping("/manager-only-test")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> managerOnlyTest() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
            String name = authentication != null ? authentication.getName() : "none";
            String principal = authentication != null
                    ? (authentication.getPrincipal() != null ? authentication.getPrincipal().toString() : "null")
                    : "none";
            String authorities = authentication != null ? authentication.getAuthorities().toString() : "none";

            return ResponseEntity.ok(Map.of(
                    "authenticated", isAuthenticated,
                    "name", name,
                    "principal", principal,
                    "authorities", authorities,
                    "message", "You have access as a manager!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Add a debug version of createRequest
    @PostMapping("/debug-create")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> debugCreateRequest(@Valid @RequestBody RequestCreateRequest createRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("DEBUG-CREATE: Authentication: " + authentication);
            System.out.println("DEBUG-CREATE: Is authenticated: " + authentication.isAuthenticated());
            System.out.println("DEBUG-CREATE: Principal: " + authentication.getPrincipal());
            System.out.println("DEBUG-CREATE: Authorities: " + authentication.getAuthorities());

            if (authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                System.out.println("DEBUG-CREATE: User details - ID: " + userDetails.getId() +
                        ", Username: " + userDetails.getUsername() +
                        ", Roles: " + userDetails.getAuthorities());
            }

            // Get the user
            User currentUser;
            try {
                currentUser = getCurrentUser();
                System.out.println("DEBUG-CREATE: Successfully got current user: " + currentUser.getUsername());
            } catch (Exception e) {
                System.out.println("DEBUG-CREATE: Error getting current user: " + e.getMessage());
                e.printStackTrace();

                // Fallback to getting user by name
                String username = authentication.getName();
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    currentUser = userOpt.get();
                    System.out.println("DEBUG-CREATE: Fallback - found user by name: " + username);
                } else {
                    System.out.println("DEBUG-CREATE: Fallback - user not found by name: " + username);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new MessageResponse("User not found: " + username));
                }
            }

            // For debug purposes, just return success without creating in DB
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("message",
                    "Debug request received from " + currentUser.getUsername() + " with role " + currentUser.getRole());
            responseData.put("receivedData", createRequest);

            return ResponseEntity.status(HttpStatus.OK).body(responseData);
        } catch (Exception e) {
            System.err.println("DEBUG-CREATE: Error in debug create: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error in debug request: " + e.getMessage()));
        }
    }

    // Add a new endpoint with a different path for creating requests
    @PostMapping("/create-new")
    @PreAuthorize("hasAnyAuthority('ROLE_FRONTDESK', 'ROLE_MANAGER', 'ROLE_PROCESSING')")
    public ResponseEntity<?> createNewRequest(@Valid @RequestBody RequestCreateRequest createRequest) {
        try {
            // Validate that at least one identifier is provided
            if (isEmpty(createRequest.getCin()) && isEmpty(createRequest.getIfValue())
                    && isEmpty(createRequest.getIce())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Error: At least one identifier (CIN, IF, or ICE) must be provided"));
            }

            // Get current user
            User currentUser = getCurrentUser();

            // Create new request
            Request request = new Request();
            request.setDateEntree(createRequest.getDateEntree());
            request.setRaisonSocialeNomsPrenom(createRequest.getRaisonSocialeNomsPrenom());
            request.setCin(createRequest.getCin());
            request.setPmPp(createRequest.getPmPp());
            request.setObjet(createRequest.getObjet());
            request.setIfValue(createRequest.getIfValue());
            request.setIce(createRequest.getIce());
            request.setEtat("NOUVEAU"); // Default state
            request.setCreator(currentUser);
            request.setCreatedAt(LocalDateTime.now());
            request.setUpdatedAt(LocalDateTime.now());

            Request savedRequest = requestRepository.save(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedRequest));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating request: " + e.getMessage()));
        }
    }

    // Helper method to check if a string is empty
    private boolean isEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }
}