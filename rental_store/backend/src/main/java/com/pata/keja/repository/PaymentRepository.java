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
import java.util.Collection;
import java.time.Instant;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    @EntityGraph(attributePaths = { "student", "student.room", "student.hostel", "hostel", "room", "recordedBy" })
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
    Page<Payment> findAllByStudentId(String studentId, Pageable pageable);

    @EntityGraph(attributePaths = { "student", "hostel", "room" })
    Page<Payment> findAllByHostelIdAndStatus(
            String hostelId,
            PaymentStatus status,
            Pageable pageable);

    @EntityGraph(attributePaths = {
            "student", "student.room", "student.hostel",
            "hostel", "room", "recordedBy"
    })
    @Query("""
        select p from Payment p
        where p.hostel.id in :hostelIds
          and (:studentId is null or p.student.id = :studentId)
          and (:hostelId is null or p.hostel.id = :hostelId)
          and (:roomId is null or p.room.id = :roomId)
          and (:minAmount is null or p.amount >= :minAmount)
          and (:maxAmount is null or p.amount <= :maxAmount)
          and (:status is null or p.status = :status)
          and (:method is null or p.method = :method)
          and (:periodLabel is null or p.periodLabel = :periodLabel)
          and (:reference is null or lower(p.reference) like lower(concat('%', :reference, '%')))
          and (:studentQuery is null
               or lower(p.student.name) like lower(concat('%', :studentQuery, '%'))
               or lower(p.student.email) like lower(concat('%', :studentQuery, '%')))
          and (
              (:dateOnPaid = true and
                (:fromInstant is null or p.paidAt >= :fromInstant) and
                (:toExclusiveInstant is null or p.paidAt < :toExclusiveInstant))
              or
              (:dateOnPaid = false and
                (:fromDate is null or p.dueDate >= :fromDate) and
                (:toDate is null or p.dueDate <= :toDate))
          )
        """)
    Page<Payment> searchForHostels(
            @Param("hostelIds") Collection<String> hostelIds,
            @Param("studentId") String studentId,
            @Param("hostelId") String hostelId,
            @Param("roomId") String roomId,
            @Param("minAmount") Long minAmount,
            @Param("maxAmount") Long maxAmount,
            @Param("status") PaymentStatus status,
            @Param("method") com.pata.keja.enums.PaymentMethod method,
            @Param("periodLabel") String periodLabel,
            @Param("reference") String reference,
            @Param("studentQuery") String studentQuery,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("fromInstant") Instant fromInstant,
            @Param("toExclusiveInstant") Instant toExclusiveInstant,
            @Param("dateOnPaid") boolean dateOnPaid,
            Pageable pageable);

    @Query("""
        select p.hostel.id, p.status, count(p), coalesce(sum(p.amount), 0),
               coalesce(sum(case when p.status = com.pata.keja.enums.PaymentStatus.PAID
                                  and p.paidAt >= :monthStart and p.paidAt < :monthEnd
                                 then p.amount else 0 end), 0)
        from Payment p
        where p.hostel.id in :hostelIds
        group by p.hostel.id, p.status
        """)
    List<Object[]> aggregateByHostelAndStatus(
            @Param("hostelIds") Collection<String> hostelIds,
            @Param("monthStart") Instant monthStart,
            @Param("monthEnd") Instant monthEnd);

    @Query("""
        select coalesce(sum(p.amount), 0)
        from Payment p
        where p.hostel.id in :hostelIds
          and p.status = com.pata.keja.enums.PaymentStatus.PAID
          and p.paidAt >= :monthStart and p.paidAt < :monthEnd
        """)
    long sumPaidThisMonth(
            @Param("hostelIds") Collection<String> hostelIds,
            @Param("monthStart") Instant monthStart,
            @Param("monthEnd") Instant monthEnd);

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
                where p.status = com.pata.keja.enums.PaymentStatus.PENDING
                  and p.dueDate < :today
            """)
    List<Payment> findOverdueCandidates(@Param("today") LocalDate today);

    /** Students who owe money in a hostel — for reminders. */
    @Query("""
                select distinct p.student.id from Payment p
                where p.hostel.id = :hostelId
                  and p.status in (
                    com.pata.keja.enums.PaymentStatus.PENDING,
                    com.pata.keja.enums.PaymentStatus.OVERDUE
                  )
            """)
    List<String> findStudentIdsWithOutstandingPayments(@Param("hostelId") String hostelId);
}
