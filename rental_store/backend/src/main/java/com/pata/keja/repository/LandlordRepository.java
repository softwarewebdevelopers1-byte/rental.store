package com.pata.keja.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pata.keja.enums.VerificationStatus;
import com.pata.keja.models.Landlord;

import java.util.Optional;

public interface LandlordRepository extends JpaRepository<Landlord, String> {

    Optional<Landlord> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    /**
     * Loads the landlord together with hostels (and each hostel's rooms and
     * images) so the mapper can build a full LandlordResponse in one shot.
     * Warning: this can be an expensive query for landlords with many hostels —
     * prefer paginating or fetching hostels lazily in that case.
     */
    @EntityGraph(attributePaths = {
            "hostels",
            "hostels.rooms",
            "hostels.images"
    })
    @Query("select l from Landlord l where l.id = :id")
    Optional<Landlord> findByIdWithHostels(@Param("id") String id);

    Page<Landlord> findAllByVerificationStatus(
            VerificationStatus status,
            Pageable pageable);

    long countByVerificationStatus(VerificationStatus status);
}
