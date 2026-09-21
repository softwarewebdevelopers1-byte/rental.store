package com.pata.keja.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pata.keja.enums.RoomStatus;
import com.pata.keja.models.Room;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, String> {

    boolean existsByHostelIdAndNumber(String hostelId, String number);

    boolean existsByHostelIdAndNumberAndIdNot(String hostelId, String number, String id);

    @EntityGraph(attributePaths = { "hostel", "tenant" })
    @Query("select r from Room r where r.id = :id")
    Optional<Room> findByIdWithAssociations(@Param("id") String id);

    @EntityGraph(attributePaths = { "tenant" })
    @Query("select r from Room r where r.hostel.id = :hostelId order by r.number")
    List<Room> findAllByHostelId(@Param("hostelId") String hostelId);

    @Query("""
                select r from Room r
                where r.hostel.id = :hostelId
                  and r.status = com.pata.keja.enums.RoomStatus.VACANT
                order by r.number
            """)
    List<Room> findVacantByHostel(@Param("hostelId") String hostelId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Room r where r.id = :id")
    Optional<Room> findByIdForUpdate(@Param("id") String id);

    /** First vacant room in a hostel, used on student-accept. */
    @Query("""
                select r from Room r
                where r.hostel.id = :hostelId
                  and r.status = :status
                order by r.number
            """)
    List<Room> findByHostelAndStatusOrderByNumber(
            @Param("hostelId") String hostelId,
            @Param("status") RoomStatus status);

    long countByHostelIdAndStatus(String hostelId, RoomStatus status);

    long countByHostelId(String hostelId);

    long countByStatus(RoomStatus status);
}
