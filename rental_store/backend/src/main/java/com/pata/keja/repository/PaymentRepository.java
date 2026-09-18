package com.pata.keja.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.models.Payment;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    @EntityGraph(attributePaths = { "student", "hostel", "room" })
    @Query("""
                select p from Payment p
                where p.student.id = :studentId
                order by p.dueDate desc
            """)
    List<Payment> findAllByStudentWithAssociations(@Param("studentId") String studentId);

    @EntityGraph(attributePaths = { "student", "hostel", "room" })
    @Query("select p from Payment p where p.id = :id")
    Optional<Payment> findByIdWithAssociations(@Param("id") String id);

    @EntityGraph(attributePaths = { "student", "hostel", "room" })
    Page<Payment> findAllByHostelId(String hostelId, Pageable pageable);

    @EntityGraph(attributePaths = { "student", "hostel", "room" })
    Page<Payment> findAllByHostelIdAndStatus(
            String hostelId,
            PaymentStatus status,
            Pageable pageable);

    long countByHostelIdAndStatus(String hostelId, PaymentStatus status);

    @Query("""
                select coalesce(sum(p.amount), 0) from Payment p
                where p.hostel.id = :hostelId and p.status = :status
            """)
    long sumByHostelAndStatus(
            @Param("hostelId") String hostelId,
            @Param("status") PaymentStatus status);

    /** For scheduled job: flip PENDING to OVERDUE when past due. */
    @Query("""
                select p from Payment p
                where p.status = com.yourorg.hostelhub.domain.enums.PaymentStatus.PENDING
                  and p.dueDate < :today
            """)
    List<Payment> findOverdueCandidates(@Param("today") LocalDate today);

    /** Students who owe money in a hostel — for reminders. */
    @Query("""
                select distinct p.student.id from Payment p
                where p.hostel.id = :hostelId
                  and p.status in (
                    com.yourorg.hostelhub.domain.enums.PaymentStatus.PENDING,
                    com.yourorg.hostelhub.domain.enums.PaymentStatus.OVERDUE
                  )
            """)
    List<String> findStudentIdsWithOutstandingPayments(@Param("hostelId") String hostelId);
}
