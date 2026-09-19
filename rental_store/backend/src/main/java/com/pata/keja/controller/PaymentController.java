package com.pata.keja.controller;

import java.net.URI;

import jakarta.validation.Valid;

import com.pata.keja.dto.payment.LandlordPaymentStatsResponse;
import com.pata.keja.dto.payment.PaymentCreateRequest;
import com.pata.keja.dto.payment.PaymentReminderRequest;
import com.pata.keja.dto.payment.PaymentResponse;
import com.pata.keja.dto.payment.PaymentSummaryResponse;
import com.pata.keja.dto.payment.StudentPaymentSummaryResponse;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.PaymentService;
import com.pata.keja.service.PaymentService.PaymentStatusFilter;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Rent payment tracking — the student payment page and landlord collections dashboard. */
@RestController
@RequestMapping("/api/payments")
@PreAuthorize("isAuthenticated()")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/me/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentPaymentSummaryResponse summary(
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return paymentService.summaryForStudent(principal.id());
    }

    @PostMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaymentResponse> recordPayment(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody PaymentCreateRequest request) {
        PaymentResponse response = paymentService.recordPayment(principal.id(), request);
        return ResponseEntity.created(URI.create("/api/payments/" + response.id())).body(response);
    }

    @GetMapping("/hostel/{hostelId}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public Page<PaymentSummaryResponse> listForHostel(
            @PathVariable String hostelId,
            @RequestParam(required = false) PaymentStatusFilter status,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return paymentService.listForHostel(hostelId, status, pageable);
    }

    @GetMapping("/hostel/{hostelId}/stats")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public LandlordPaymentStatsResponse statsForHostel(@PathVariable String hostelId) {
        return paymentService.statsForHostel(hostelId);
    }

    @PostMapping("/reminders")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<Void> sendReminders(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody PaymentReminderRequest request) {
        paymentService.sendReminders(principal.id(), request);
        return ResponseEntity.noContent().build();
    }
}
