package com.pata.keja.controller;

import java.util.List;

import com.pata.keja.dto.caretaker.CaretakerResponse;
import com.pata.keja.dto.caretaker.CaretakerStatsResponse;
import com.pata.keja.dto.caretaker.CaretakerSummaryResponse;
import com.pata.keja.dto.hostel.HostelSummaryResponse;
import com.pata.keja.dto.student.StudentSummaryResponse;
import com.pata.keja.service.CaretakerService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Caretaker dashboard data — assigned hostels, tenants, and maintenance metrics. */
@RestController
@RequestMapping("/api/caretakers")
@PreAuthorize("isAuthenticated()")
public class CaretakerController {

    private final CaretakerService caretakerService;

    public CaretakerController(CaretakerService caretakerService) {
        this.caretakerService = caretakerService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CARETAKER')")
    public CaretakerResponse getCurrent() {
        return caretakerService.getCurrent();
    }

    @GetMapping("/me/hostels")
    @PreAuthorize("hasRole('CARETAKER')")
    public List<HostelSummaryResponse> listAssignedHostels() {
        return caretakerService.listAssignedHostels();
    }

    @GetMapping("/me/stats")
    @PreAuthorize("hasRole('CARETAKER')")
    public CaretakerStatsResponse stats() {
        return caretakerService.stats();
    }

    @GetMapping("/me/tenants")
    @PreAuthorize("hasRole('CARETAKER')")
    public Page<StudentSummaryResponse> listTenants(
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return caretakerService.listTenants(pageable);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<CaretakerSummaryResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return caretakerService.list(pageable);
    }
}
