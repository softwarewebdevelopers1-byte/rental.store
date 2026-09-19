package com.pata.keja.controller;

import jakarta.validation.Valid;

import com.pata.keja.dto.admin.PlatformStatsResponse;
import com.pata.keja.dto.admin.UserSummaryResponse;
import com.pata.keja.dto.landlord.LandlordResponse;
import com.pata.keja.dto.landlord.LandlordSummaryResponse;
import com.pata.keja.dto.landlord.VerificationDecisionRequest;
import com.pata.keja.enums.UserRoles;
import com.pata.keja.service.AdminService;

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

import java.util.List;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Admin user administration — the admin users feature in the frontend. */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public Page<UserSummaryResponse> listUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UserRoles role,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return adminService.listUsers(q, role, pageable);
    }

    @GetMapping(value = "/users", params = "ids")
    public Page<UserSummaryResponse> listUsersByIds(
            @RequestParam List<String> ids,
            @PageableDefault(size = 100, sort = "createdAt", direction = DESC) Pageable pageable) {
        return adminService.listUsersByIds(ids, pageable);
    }

    @GetMapping("/users/{id}")
    public UserSummaryResponse getUser(@PathVariable("id") String id) {
        return adminService.getUser(id);
    }

    @GetMapping("/stats")
    public PlatformStatsResponse stats() {
        return adminService.stats();
    }

    @GetMapping("/landlords/verifications")
    public Page<LandlordSummaryResponse> listVerificationRequests(
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return adminService.listVerificationRequests(pageable);
    }

    @PostMapping("/landlords/{id}/verification")
    public LandlordResponse decideVerification(
            @PathVariable String id,
            @Valid @RequestBody VerificationDecisionRequest request) {
        return adminService.decideVerification(id, request);
    }

    @PatchMapping("/users/{id}/active")
    public ResponseEntity<Void> setUserActive(
            @PathVariable("id") String id,
            @RequestParam boolean active) {
        adminService.setActive(id, active);
        return ResponseEntity.noContent().build();
    }
}
