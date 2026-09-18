package com.pata.keja.repository;

import com.pata.keja.models.MarketAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MarketAgentRepository extends JpaRepository<MarketAgent, String> {

    Optional<MarketAgent> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("select count(p) from Product p where p.agent.id = :agentId and p.active = true")
    long countActiveProducts(@Param("agentId") String agentId);

    @Query("select count(p) from Pack p where p.agent.id = :agentId and p.active = true")
    long countActivePacks(@Param("agentId") String agentId);
}
