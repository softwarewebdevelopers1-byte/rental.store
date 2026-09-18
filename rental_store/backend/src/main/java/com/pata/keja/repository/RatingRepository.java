package com.pata.keja.repository;

import com.pata.keja.models.Rating;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, String> {

    boolean existsByHostelIdAndStudentId(String hostelId, String studentId);

    Optional<Rating> findByHostelIdAndStudentId(String hostelId, String studentId);

    @EntityGraph(attributePaths = { "student", "hostel" })
    @Query("select r from Rating r where r.id = :id")
    Optional<Rating> findByIdWithAssociations(@Param("id") String id);

    @EntityGraph(attributePaths = { "student" })
    @Query("""
                select r from Rating r
                where r.hostel.id = :hostelId
                order by r.createdAt desc
            """)
    List<Rating> findAllForHostel(@Param("hostelId") String hostelId);

    @EntityGraph(attributePaths = { "hostel" })
    @Query("""
                select r from Rating r
                where r.student.id = :studentId
                order by r.createdAt desc
            """)
    List<Rating> findAllByStudent(@Param("studentId") String studentId);

    @Query("select avg(r.stars) from Rating r where r.hostel.id = :hostelId")
    Double averageStarsForHostel(@Param("hostelId") String hostelId);

    long countByHostelId(String hostelId);
}
