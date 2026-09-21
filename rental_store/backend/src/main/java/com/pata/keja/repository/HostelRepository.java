package com.pata.keja.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pata.keja.models.Hostel;

import java.util.Optional;
import java.util.List;
import java.util.Collection;

public interface HostelRepository extends JpaRepository<Hostel, String> {

    Optional<Hostel> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);

    /**
     * Full hostel with everything the HostelResponse mapper needs.
     * Do not use this in list endpoints — use the summary query below.
     * Note: Only fetch single-valued associations to avoid MultipleBagFetchException.
     * Collections (rooms, caretakers, images) are loaded via lazy loading or separate queries.
     */
    @EntityGraph(attributePaths = { "landlord" }, type = EntityGraph.EntityGraphType.LOAD)
    @Query("select h from Hostel h where h.id = :id")
    Optional<Hostel> findByIdWithDetails(@Param("id") String id);

    @EntityGraph(attributePaths = { "landlord" }, type = EntityGraph.EntityGraphType.LOAD)
    @Query("select h from Hostel h where h.id = :id")
    Optional<Hostel> findByIdWithPaymentRecorderDetails(@Param("id") String id);

    @Query("select h.id from Hostel h where h.landlord.id = :landlordId and h.active = true")
    List<String> findActiveIdsByLandlordId(@Param("landlordId") String landlordId);

    @EntityGraph(attributePaths = { "landlord" })
    List<Hostel> findAllByIdIn(Collection<String> ids);

    /**
     * Landlord's own hostels — paginated, with only the collections the
     * HostelSummaryResponse needs. This keeps the query cheap.
     * Note: Only fetch landlord (single-valued); collections loaded via lazy loading.
     */
    @EntityGraph(attributePaths = { "landlord" }, type = EntityGraph.EntityGraphType.LOAD)
    Page<Hostel> findAllByLandlordIdAndActiveTrue(String landlordId, Pageable pageable);

    long countByActiveTrue();

    @EntityGraph(attributePaths = { "landlord" }, type = EntityGraph.EntityGraphType.LOAD)
    @Query("select h from Hostel h")
    Page<Hostel> findAllForAdmin(Pageable pageable);

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

    @EntityGraph(attributePaths = { "landlord" }, type = EntityGraph.EntityGraphType.LOAD)
    @Query("""
                select h from Hostel h
                where h.active = true
                  and (:q is null or lower(h.name) like lower(concat('%', :q, '%'))
                                  or lower(h.location) like lower(concat('%', :q, '%')))
                  and (:location is null or lower(h.location) like lower(concat('%', :location, '%')))
                  and (:minPrice is null or exists (select r1 from Room r1 where r1.hostel = h and r1.price >= :minPrice))
                  and (:maxPrice is null or exists (select r2 from Room r2 where r2.hostel = h and r2.price <= :maxPrice))
                  and (:vacantOnly is null or :vacantOnly = false or exists
                       (select r3 from Room r3 where r3.hostel = h and r3.status = com.pata.keja.enums.RoomStatus.VACANT))
                  and (:minRating is null or h.rating >= :minRating)
            """)
    Page<Hostel> searchFiltered(
            @Param("q") String q,
            @Param("location") String location,
            @Param("minPrice") Long minPrice,
            @Param("maxPrice") Long maxPrice,
            @Param("vacantOnly") Boolean vacantOnly,
            @Param("minRating") Double minRating,
            Pageable pageable);
}
