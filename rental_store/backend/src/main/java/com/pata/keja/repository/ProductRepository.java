package com.pata.keja.repository;

import com.pata.keja.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {

    @EntityGraph(attributePaths = { "agent" })
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdWithAgent(@Param("id") String id);

    @EntityGraph(attributePaths = { "agent" })
    Page<Product> findAllByActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = { "agent" })
    Page<Product> findAllByAgentId(String agentId, Pageable pageable);

    @EntityGraph(attributePaths = { "agent" })
    @Query("""
                select p from Product p
                where p.active = true
                  and (:q is null or lower(p.name) like lower(concat('%', :q, '%'))
                                  or lower(p.description) like lower(concat('%', :q, '%')))
            """)
    Page<Product> searchActive(@Param("q") String q, Pageable pageable);
}
