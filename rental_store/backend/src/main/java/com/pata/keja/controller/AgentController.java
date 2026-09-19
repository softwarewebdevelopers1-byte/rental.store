package com.pata.keja.controller;

import java.net.URI;

import jakarta.validation.Valid;

import com.pata.keja.dto.agent.MarketAgentCreateRequest;
import com.pata.keja.dto.agent.MarketAgentResponse;
import com.pata.keja.dto.agent.MarketAgentSummaryResponse;
import com.pata.keja.service.MarketAgentService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Market-agent administration — the admin marketplace partner management screen. */
@RestController
@RequestMapping("/api/agents")
@PreAuthorize("isAuthenticated()")
public class AgentController {

    private final MarketAgentService marketAgentService;

    public AgentController(MarketAgentService marketAgentService) {
        this.marketAgentService = marketAgentService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<MarketAgentSummaryResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return marketAgentService.list(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MarketAgentResponse getById(@PathVariable String id) {
        return marketAgentService.getById(id);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MARKET_AGENT')")
    public MarketAgentResponse getCurrent() {
        return marketAgentService.getCurrent();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarketAgentResponse> create(
            @Valid @RequestBody MarketAgentCreateRequest request) {
        MarketAgentResponse response = marketAgentService.create(request);
        return ResponseEntity.created(URI.create("/api/agents/" + response.id())).body(response);
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> setActive(
            @PathVariable String id,
            @RequestParam boolean active) {
        marketAgentService.setActive(id, active);
        return ResponseEntity.noContent().build();
    }
}
