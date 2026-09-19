package com.pata.keja.controller;

import jakarta.validation.Valid;

import com.pata.keja.dto.landlord.LandlordResponse;
import com.pata.keja.dto.landlord.LandlordStatsResponse;
import com.pata.keja.dto.landlord.LandlordSummaryResponse;
import com.pata.keja.dto.landlord.LandlordUpdateRequest;
import com.pata.keja.service.LandlordService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Landlord profile and verification — landlord account and admin landlord screens. */
@RestController
@RequestMapping("/api/landlords")
@PreAuthorize("isAuthenticated()")
public class LandlordController {

    private final LandlordService landlordService;

    public LandlordController(LandlordService landlordService) {
        this.landlordService = landlordService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('LANDLORD')")
    public LandlordResponse getCurrent() {
        return landlordService.getCurrent();
    }

    @PatchMapping("/me")
    @PreAuthorize("hasRole('LANDLORD')")
    public LandlordResponse updateCurrent(@Valid @RequestBody LandlordUpdateRequest request) {
        return landlordService.updateCurrent(request);
    }

    @PostMapping("/me/verification/request")
    @PreAuthorize("hasRole('LANDLORD')")
    public LandlordResponse requestVerification() {
        return landlordService.requestVerification();
    }

    @GetMapping("/me/stats")
    @PreAuthorize("hasRole('LANDLORD')")
    public LandlordStatsResponse stats() {
        return landlordService.getStats();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<LandlordSummaryResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return landlordService.list(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    public LandlordResponse getById(@PathVariable String id) {
        return landlordService.getById(id);
    }
}
