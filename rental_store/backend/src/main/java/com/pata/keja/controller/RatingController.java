package com.pata.keja.controller;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;

import com.pata.keja.dto.rating.HostelRatingStatsResponse;
import com.pata.keja.dto.rating.RatingCreateRequest;
import com.pata.keja.dto.rating.RatingResponse;
import com.pata.keja.dto.rating.RatingSummaryResponse;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.RatingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public hostel reviews and ratings — the hostel detail and student review flows. */
@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping("/hostel/{hostelId}")
    public List<RatingSummaryResponse> listForHostel(@PathVariable String hostelId) {
        return ratingService.listForHostel(hostelId);
    }

    @GetMapping("/hostel/{hostelId}/stats")
    public HostelRatingStatsResponse statsForHostel(@PathVariable String hostelId) {
        return ratingService.statsForHostel(hostelId);
    }

    @GetMapping("/me/hostel/{hostelId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RatingResponse> findMyRating(
            @PathVariable String hostelId,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        Optional<RatingResponse> rating = ratingService.findMyRatingForHostel(principal.id(), hostelId);
        return rating.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/me/hostel/{hostelId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RatingResponse> upsert(
            @PathVariable String hostelId,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody RatingCreateRequest request) {
        RatingResponse response = ratingService.upsert(principal.id(), hostelId, request);
        return ResponseEntity.created(URI.create("/api/ratings/" + response.id())).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        ratingService.delete(id, principal.id());
        return ResponseEntity.noContent().build();
    }
}
