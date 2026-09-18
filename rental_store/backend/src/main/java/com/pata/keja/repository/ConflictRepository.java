package com.pata.keja.repository;

import com.pata.keja.enums.ConflictStatus;
import com.pata.keja.models.Conflict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConflictRepository extends JpaRepository<Conflict, String> {

    @EntityGraph(attributePaths = { "order", "student", "agent", "resolvedBy" })
    @Query("select c from Conflict c where c.id = :id")
    Optional<Conflict> findByIdWithDetails(@Param("id") String id);

    @EntityGraph(attributePaths = { "order", "student", "agent" })
    Page<Conflict> findAllByStudentId(String studentId, Pageable pageable);

    @EntityGraph(attributePaths = { "order", "student", "agent" })
    Page<Conflict> findAllByAgentId(String agentId, Pageable pageable);

    @EntityGraph(attributePaths = { "order", "student", "agent" })
    Page<Conflict> findAllByStatus(ConflictStatus status, Pageable pageable);

    boolean existsByOrderId(String orderId);

    List<Conflict> findAllByOrderId(String orderId);

    long countByStatus(ConflictStatus status);
}
