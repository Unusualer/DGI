package com.dgi.app.controller;

import com.dgi.app.model.TypeAttestation;
import com.dgi.app.payload.request.TypeAttestationRequest;
import com.dgi.app.payload.response.MessageResponse;
import com.dgi.app.payload.response.TypeAttestationResponse;
import com.dgi.app.repository.TypeAttestationRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/type-attestations")
public class TypeAttestationController {
    @Autowired
    TypeAttestationRepository typeAttestationRepository;

    // Convert entity to DTO
    private TypeAttestationResponse convertToDTO(TypeAttestation typeAttestation) {
        return new TypeAttestationResponse(
                typeAttestation.getId(),
                typeAttestation.getLabel(),
                typeAttestation.getCreatedAt());
    }

    // Get all types - accessible to all authenticated users
    @GetMapping
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('PROCESSING') or hasRole('MANAGER')")
    public ResponseEntity<List<TypeAttestationResponse>> getAllTypes() {
        List<TypeAttestation> types = typeAttestationRepository.findAll();
        List<TypeAttestationResponse> typeDTOs = types.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(typeDTOs);
    }

    // Get a type by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> getTypeById(@PathVariable Long id) {
        Optional<TypeAttestation> typeOptional = typeAttestationRepository.findById(id);
        if (typeOptional.isPresent()) {
            return ResponseEntity.ok(convertToDTO(typeOptional.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Type d'attestation non trouvé"));
        }
    }

    // Create a new type - only MANAGER can create
    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> createType(@Valid @RequestBody TypeAttestationRequest typeRequest) {
        try {
            // Check if a type with this label already exists
            Optional<TypeAttestation> existingType = typeAttestationRepository.findByLabel(typeRequest.getLabel());
            if (existingType.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse("Un type d'attestation avec ce label existe déjà"));
            }

            // Create a new type
            TypeAttestation newType = new TypeAttestation();
            newType.setLabel(typeRequest.getLabel());
            newType.setCreatedAt(LocalDateTime.now());

            TypeAttestation savedType = typeAttestationRepository.save(newType);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Erreur lors de la création du type d'attestation: " + e.getMessage()));
        }
    }

    // Update an existing type - only MANAGER can update
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> updateType(@PathVariable Long id, @Valid @RequestBody TypeAttestationRequest typeRequest) {
        try {
            // Find the type to update
            Optional<TypeAttestation> typeOptional = typeAttestationRepository.findById(id);
            if (!typeOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Type d'attestation non trouvé"));
            }

            // Check if the new label conflicts with an existing type
            Optional<TypeAttestation> existingType = typeAttestationRepository.findByLabel(typeRequest.getLabel());
            if (existingType.isPresent() && !existingType.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse("Un type d'attestation avec ce label existe déjà"));
            }

            // Update the type
            TypeAttestation typeToUpdate = typeOptional.get();
            typeToUpdate.setLabel(typeRequest.getLabel());

            TypeAttestation updatedType = typeAttestationRepository.save(typeToUpdate);
            return ResponseEntity.ok(convertToDTO(updatedType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse(
                            "Erreur lors de la mise à jour du type d'attestation: " + e.getMessage()));
        }
    }

    // Delete a type - only MANAGER can delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> deleteType(@PathVariable Long id) {
        try {
            // Find the type to delete
            Optional<TypeAttestation> typeOptional = typeAttestationRepository.findById(id);
            if (!typeOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Type d'attestation non trouvé"));
            }

            // Delete the type
            typeAttestationRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Type d'attestation supprimé avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse(
                            "Erreur lors de la suppression du type d'attestation: " + e.getMessage()));
        }
    }

    // Search types by label
    @GetMapping("/search")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<TypeAttestationResponse>> searchTypes(@RequestParam String query) {
        List<TypeAttestation> types = typeAttestationRepository.findByLabelContainingIgnoreCase(query);
        List<TypeAttestationResponse> typeDTOs = types.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(typeDTOs);
    }
}