package com.pata.keja.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pata.keja.models.Caretaker;

import java.util.List;
import java.util.Optional;

public interface CaretakerRepository extends JpaRepository<Caretaker, String> {

    Optional<Caretaker> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = { "assignedHostels" })
    @Query("select c from Caretaker c where c.id = :id")
    Optional<Caretaker> findByIdWithHostels(@Param("id") String id);

    /**
     * All caretakers assigned to a specific hostel.
     */
    @Query("""
                select c from Caretaker c
                join c.assignedHostels h
                where h.id = :hostelId
            """)
    List<Caretaker> findAllByAssignedHostel(@Param("hostelId") String hostelId);
}
