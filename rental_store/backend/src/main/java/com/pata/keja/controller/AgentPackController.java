package com.pata.keja.controller;

import java.net.URI;

import jakarta.validation.Valid;

import com.pata.keja.dto.marketplace.PackCreateRequest;
import com.pata.keja.dto.marketplace.PackResponse;
import com.pata.keja.dto.marketplace.PackSummaryResponse;
import com.pata.keja.dto.marketplace.PackUpdateRequest;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.PackService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Agent pack management — the market-agent bundle dashboard. */
@RestController
@RequestMapping("/api/agents/me/packs")
@PreAuthorize("hasRole('MARKET_AGENT')")
public class AgentPackController {

    private final PackService packService;

    public AgentPackController(PackService packService) {
        this.packService = packService;
    }

    @GetMapping
    public Page<PackSummaryResponse> list(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return packService.listByAgent(principal.id(), pageable);
    }

    @PostMapping
    public ResponseEntity<PackResponse> create(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody PackCreateRequest request) {
        PackResponse response = packService.create(principal.id(), request);
        return ResponseEntity.created(URI.create("/api/marketplace/packs/" + response.id())).body(response);
    }

    @PatchMapping("/{id}")
    public PackResponse update(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody PackUpdateRequest request) {
        return packService.update(id, principal.id(), request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        packService.deactivate(id, principal.id());
        return ResponseEntity.noContent().build();
    }
}
