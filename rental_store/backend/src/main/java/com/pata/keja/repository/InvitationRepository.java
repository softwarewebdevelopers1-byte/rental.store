package com.pata.keja.repository;

import com.pata.keja.enums.InvitationKind;
import com.pata.keja.enums.InvitationStatus;
import com.pata.keja.models.Invitation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, String> {

    Optional<Invitation> findByToken(String token);

    boolean existsByToken(String token);

    @EntityGraph(attributePaths = { "createdBy", "usedBy" })
    @Query("select i from Invitation i where i.id = :id")
    Optional<Invitation> findByIdWithDetails(@Param("id") String id);

    Page<Invitation> findAllByStatus(InvitationStatus status, Pageable pageable);

    Page<Invitation> findAllByKind(InvitationKind kind, Pageable pageable);

    @EntityGraph(attributePaths = { "createdBy", "usedBy" })
    @Query("""
                select i from Invitation i
                where (:status is null or i.status = :status)
                  and (:kind is null or i.kind = :kind)
                order by i.createdAt desc
            """)
    Page<Invitation> search(@Param("status") InvitationStatus status,
            @Param("kind") InvitationKind kind,
            Pageable pageable);

    /**
     * Scheduler job: mark all ACTIVE invitations whose expiresAt has passed
     * as EXPIRED. One bulk UPDATE.
     */
    @Modifying
    @Query("""
                update Invitation i
                set i.status = com.pata.keja.domain.enums.InvitationStatus.EXPIRED
                where i.status = com.pata.keja.domain.enums.InvitationStatus.ACTIVE
                  and i.expiresAt < :now
            """)
    int expireOverdue(@Param("now") Instant now);
}
