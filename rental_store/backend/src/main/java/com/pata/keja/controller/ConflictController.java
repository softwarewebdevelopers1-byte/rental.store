package com.pata.keja.controller;

import java.net.URI;

import jakarta.validation.Valid;

import com.pata.keja.dto.conflict.ConflictCreateRequest;
import com.pata.keja.dto.conflict.ConflictResolveRequest;
import com.pata.keja.dto.conflict.ConflictResponse;
import com.pata.keja.dto.conflict.ConflictSummaryResponse;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.ConflictService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Order conflicts — the student dispute flow and admin resolution queue. */
@RestController
@RequestMapping("/api/conflicts")
@PreAuthorize("isAuthenticated()")
public class ConflictController {

    private final ConflictService conflictService;

    public ConflictController(ConflictService conflictService) {
        this.conflictService = conflictService;
    }

    @PostMapping("/me/orders/{orderId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ConflictResponse> create(
            @PathVariable String orderId,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody ConflictCreateRequest request) {
        ConflictResponse response = conflictService.create(principal.id(), orderId, request);
        return ResponseEntity.created(URI.create("/api/conflicts/" + response.id())).body(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public Page<ConflictSummaryResponse> listForCurrentStudent(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return conflictService.listForStudent(principal.id(), pageable);
    }

    @GetMapping("/agent")
    @PreAuthorize("hasRole('MARKET_AGENT')")
    public Page<ConflictSummaryResponse> listForCurrentAgent(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return conflictService.listForAgent(principal.id(), pageable);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ConflictSummaryResponse> listAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return conflictService.listAll(pageable);
    }

    @GetMapping("/{id}")
    public ConflictResponse getById(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return conflictService.getById(id, principal.id());
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ConflictResponse resolve(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody ConflictResolveRequest request) {
        return conflictService.resolve(id, principal.id(), request);
    }
}
