package com.pata.keja.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.models.Student;

import java.util.List;
import java.util.Collection;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, String> {

    Optional<Student> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = { "hostel", "room", "requestedHostel" })
    Optional<Student> findWithAssociationsById(String id);

    @EntityGraph(attributePaths = { "hostel", "room" })
    List<Student> findAllByHostelId(String hostelId);

    @EntityGraph(attributePaths = { "room", "hostel" })
    Page<Student> findAllByMembershipStatus(MembershipStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "room", "hostel" })
    Page<Student> findAllByHostelIdInAndMembershipStatus(
            Collection<String> hostelIds,
            MembershipStatus status,
            Pageable pageable);

    @EntityGraph(attributePaths = { "room", "hostel" })
    Page<Student> findAllByHostelIdAndMembershipStatus(
            String hostelId,
            MembershipStatus status,
            Pageable pageable);

    long countByMembershipStatus(MembershipStatus status);

    @Query("""
                select s from Student s
                where s.requestedHostel.id = :hostelId
                  and s.membershipStatus = com.pata.keja.enums.MembershipStatus.PENDING
            """)
    List<Student> findPendingRequestsForHostel(@Param("hostelId") String hostelId);

    @Query("""
                select s from Student s
                where s.hostel.id = :hostelId
                  and s.membershipStatus = com.pata.keja.enums.MembershipStatus.ACTIVE
            """)
    List<Student> findActiveTenantsForHostel(@Param("hostelId") String hostelId);
}
