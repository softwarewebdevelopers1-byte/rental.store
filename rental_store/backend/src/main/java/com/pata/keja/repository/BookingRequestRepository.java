package com.pata.keja.repository;

import com.pata.keja.enums.BookingRequestStatus;
import com.pata.keja.models.BookingRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRequestRepository extends JpaRepository<BookingRequest, String> {

    @EntityGraph(attributePaths = {"student", "hostel", "room", "room.hostel", "payment"})
    @Query("select b from BookingRequest b where b.id = :id")
    Optional<BookingRequest> findByIdWithDetails(@Param("id") String id);

    @EntityGraph(attributePaths = {"student", "hostel", "room"})
    @Query("""
            select b from BookingRequest b
            where b.hostel.id in :hostelIds
              and (:status is null or b.status = :status)
            order by b.createdAt desc
            """)
    Page<BookingRequest> searchForHostels(
            @Param("hostelIds") Collection<String> hostelIds,
            @Param("status") BookingRequestStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"student", "hostel", "room"})
    @Query("""
            select b from BookingRequest b
            where b.student.id = :studentId
            order by b.createdAt desc
            """)
    List<BookingRequest> findAllByStudent(@Param("studentId") String studentId);

    @Query("""
            select b from BookingRequest b
            where b.room.id = :roomId
              and b.status in (
                  com.pata.keja.enums.BookingRequestStatus.PENDING,
                  com.pata.keja.enums.BookingRequestStatus.APPROVED
              )
            """)
    Optional<BookingRequest> findActiveForRoom(@Param("roomId") String roomId);

    @Query("""
            select b from BookingRequest b
            where b.status = com.pata.keja.enums.BookingRequestStatus.PENDING
              and b.expiresAt < :now
            """)
    List<BookingRequest> findExpiredCandidates(@Param("now") Instant now);

    boolean existsByStudentIdAndStatusIn(String studentId, Collection<BookingRequestStatus> statuses);

    long countByHostelIdInAndStatus(Collection<String> hostelIds, BookingRequestStatus status);
}
