package com.pata.keja.repository;

import com.pata.keja.enums.OrderStatus;
import com.pata.keja.models.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, String> {

    @EntityGraph(attributePaths = { "student", "agent", "items", "timeline" })
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") String id);

    @EntityGraph(attributePaths = { "agent", "items" })
    Page<Order> findAllByStudentId(String studentId, Pageable pageable);

    @EntityGraph(attributePaths = { "student", "items" })
    Page<Order> findAllByAgentId(String agentId, Pageable pageable);

    @EntityGraph(attributePaths = { "student", "agent", "items" })
    Page<Order> findAllByAgentIdAndStatus(String agentId, OrderStatus status, Pageable pageable);

    long countByAgentIdAndStatus(String agentId, OrderStatus status);
}
