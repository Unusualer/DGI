package com.dgi.app.repository;

import com.dgi.app.model.Attestation;
import com.dgi.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttestationRepository extends JpaRepository<Attestation, Long> {
    List<Attestation> findByCreator(User creator);

    List<Attestation> findByNomContainingIgnoreCase(String query);

    List<Attestation> findByCinContainingIgnoreCase(String query);

    List<Attestation> findByIfValueContainingIgnoreCase(String query);

    List<Attestation> findByType(String type);
}