package com.pata.keja.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import com.pata.keja.dto.maintenance.MaintenanceCreateRequest;
import com.pata.keja.dto.maintenance.MaintenanceResponse;
import com.pata.keja.dto.maintenance.MaintenanceStatusUpdateRequest;
import com.pata.keja.dto.maintenance.MaintenanceSummaryResponse;
import com.pata.keja.enums.MaintenanceStatus;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.MaintenanceService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Maintenance requests — the student issue-reporting and landlord work queue screens. */
@RestController
@RequestMapping("/api/maintenance")
@PreAuthorize("isAuthenticated()")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public List<MaintenanceSummaryResponse> listForCurrentStudent(
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return maintenanceService.listForStudent(principal.id());
    }

    @PostMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<MaintenanceResponse> create(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody MaintenanceCreateRequest request) {
        MaintenanceResponse response = maintenanceService.create(principal.id(), request);
        return ResponseEntity.created(URI.create("/api/maintenance/" + response.id())).body(response);
    }

    @GetMapping("/hostel/{hostelId}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('CARETAKER')")
    public List<MaintenanceSummaryResponse> listForHostel(
            @PathVariable String hostelId,
            @RequestParam(required = false) MaintenanceStatus status) {
        return maintenanceService.listForHostels(List.of(hostelId), status);
    }

    @GetMapping("/{id}")
    public MaintenanceResponse getById(@PathVariable String id) {
        return maintenanceService.getById(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('CARETAKER')")
    public MaintenanceResponse updateStatus(
            @PathVariable String id,
            @Valid @RequestBody MaintenanceStatusUpdateRequest request) {
        return maintenanceService.updateStatus(id, request.status());
    }
}
