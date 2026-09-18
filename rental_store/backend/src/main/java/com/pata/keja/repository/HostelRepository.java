package com.pata.keja.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pata.keja.models.Hostel;

import java.util.Optional;

public interface HostelRepository extends JpaRepository<Hostel, String> {

    Optional<Hostel> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);

    /**
     * Full hostel with everything the HostelResponse mapper needs.
     * Do not use this in list endpoints — use the summary query below.
     */
    @EntityGraph(attributePaths = {
            "landlord",
            "rooms",
            "images",
            "caretakers"
    })
    @Query("select h from Hostel h where h.id = :id")
    Optional<Hostel> findByIdWithDetails(@Param("id") String id);

    /**
     * Landlord's own hostels — paginated, with only the collections the
     * HostelSummaryResponse needs. This keeps the query cheap.
     */
    @EntityGraph(attributePaths = { "rooms", "images", "landlord" })
    Page<Hostel> findAllByLandlordIdAndActiveTrue(String landlordId, Pageable pageable);

    /**
     * Discovery query. Filters and sorts at the DB level.
     * Not using @EntityGraph here because dynamic filters + pagination
     * complicate fetch joins; instead we rely on the caller doing a second
     * fetch for associations, or we accept N+1 during mapper and add a
     * batch-size hint in application.yml.
     */
    @Query("""
                select h from Hostel h
                where h.active = true
                  and (:q is null or lower(h.name) like lower(concat('%', :q, '%'))
                                  or lower(h.location) like lower(concat('%', :q, '%')))
                  and (:location is null or lower(h.location) like lower(concat('%', :location, '%')))
                  and (:minRating is null or h.rating >= :minRating)
            """)
    Page<Hostel> search(
            @Param("q") String q,
            @Param("location") String location,
            @Param("minRating") Double minRating,
            Pageable pageable);
}
