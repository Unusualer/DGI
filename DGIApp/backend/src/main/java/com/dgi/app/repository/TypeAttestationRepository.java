package com.dgi.app.repository;

import com.dgi.app.model.TypeAttestation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TypeAttestationRepository extends JpaRepository<TypeAttestation, Long> {
    Optional<TypeAttestation> findByLabel(String label);

    List<TypeAttestation> findByLabelContainingIgnoreCase(String label);
}