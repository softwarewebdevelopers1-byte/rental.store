package com.pata.keja.repository;

import com.pata.keja.models.Pack;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PackRepository extends JpaRepository<Pack, String> {

    @EntityGraph(attributePaths = { "agent", "items" })
    @Query("select p from Pack p where p.id = :id")
    Optional<Pack> findByIdWithItems(@Param("id") String id);

    @EntityGraph(attributePaths = { "agent", "items" })
    Page<Pack> findAllByActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = { "agent", "items" })
    Page<Pack> findAllByAgentId(String agentId, Pageable pageable);

    @EntityGraph(attributePaths = { "agent", "items" })
    @Query("""
                select distinct p from Pack p
                where p.active = true
                  and (:q is null or lower(p.name) like lower(concat('%', :q, '%'))
                                  or lower(p.description) like lower(concat('%', :q, '%')))
            """)
    Page<Pack> searchActive(@Param("q") String q, Pageable pageable);
}
