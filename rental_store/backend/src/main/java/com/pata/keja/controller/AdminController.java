package com.pata.keja.controller;

import com.pata.keja.dto.admin.AdminResponse;
import com.pata.keja.dto.admin.AdminSummaryResponse;
import com.pata.keja.service.AdminService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public Page<AdminSummaryResponse> listUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return adminService.list(pageable);
    }

    @GetMapping("/users/{id}")
    public AdminResponse getUser(@PathVariable("id") String id) {
        return adminService.getById(id);
    }

    @PatchMapping("/users/{id}/active")
    public ResponseEntity<Void> setUserActive(
            @PathVariable("id") String id,
            @RequestParam boolean active) {
        adminService.setActive(id, active);
        return ResponseEntity.noContent().build();
    }
}
