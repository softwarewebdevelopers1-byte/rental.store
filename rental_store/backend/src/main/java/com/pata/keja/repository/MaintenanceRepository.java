package com.pata.keja.repository;

import com.pata.keja.enums.MaintenanceStatus;
import com.pata.keja.models.MaintenanceRequest;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, String> {

    @EntityGraph(attributePaths = { "student", "hostel", "room", "conversation" })
    @Query("select m from MaintenanceRequest m where m.id = :id")
    Optional<MaintenanceRequest> findByIdWithAssociations(@Param("id") String id);

    @EntityGraph(attributePaths = { "student", "room" })
    @Query("""
                select m from MaintenanceRequest m
                where m.student.id = :studentId
                order by m.createdAt desc
            """)
    List<MaintenanceRequest> findAllForStudent(@Param("studentId") String studentId);

    @EntityGraph(attributePaths = { "student", "room" })
    @Query("""
                select m from MaintenanceRequest m
                where m.hostel.id = :hostelId
                order by m.createdAt desc
            """)
    List<MaintenanceRequest> findAllForHostel(@Param("hostelId") String hostelId);

    @EntityGraph(attributePaths = { "student", "room", "hostel" })
    @Query("""
                select m from MaintenanceRequest m
                where m.hostel.id in :hostelIds
                  and (:status is null or m.status = :status)
                order by m.createdAt desc
            """)
    List<MaintenanceRequest> findAllForHostelsFiltered(
            @Param("hostelIds") List<String> hostelIds,
            @Param("status") MaintenanceStatus status);

    long countByHostelIdAndStatus(String hostelId, MaintenanceStatus status);
}
