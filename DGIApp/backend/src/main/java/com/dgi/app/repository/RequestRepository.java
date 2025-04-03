package com.dgi.app.repository;

import com.dgi.app.model.Request;
import com.dgi.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByCreator(User creator);

    List<Request> findByAgent(User agent);

    List<Request> findByRaisonSocialeNomsPrenomContainingIgnoreCase(String query);

    List<Request> findByCinContainingIgnoreCase(String query);

    List<Request> findByEtat(String etat);

    List<Request> findByCreatorAndCreatedAtBetweenAndEtat(User creator, LocalDateTime start, LocalDateTime end,
            String etat);
}