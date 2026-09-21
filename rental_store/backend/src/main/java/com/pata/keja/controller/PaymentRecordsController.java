package com.pata.keja.controller;

import com.pata.keja.dto.hostel.CaretakerPaymentPermissionRequest;
import com.pata.keja.dto.hostel.HostelPaymentRecorderResponse;
import com.pata.keja.dto.payment.LandlordPaymentSummaryResponse;
import com.pata.keja.dto.payment.PaymentBatchRecordRequest;
import com.pata.keja.dto.payment.PaymentHistoryFilter;
import com.pata.keja.dto.payment.PaymentRecordRequest;
import com.pata.keja.dto.payment.PaymentResponse;
import com.pata.keja.dto.payment.PaymentSummaryResponse;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

import static org.springframework.data.domain.Sort.Direction.DESC;

@RestController
@RequestMapping("/api")
@PreAuthorize("isAuthenticated()")
public class PaymentRecordsController {

    private final PaymentService paymentService;

    public PaymentRecordsController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/landlords/me/payments")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<PaymentResponse> recordForLandlord(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody PaymentRecordRequest request) {
        PaymentResponse response = paymentService.recordForLandlord(principal.id(), request);
        return ResponseEntity.created(URI.create("/api/payments/" + response.id())).body(response);
    }

    @PostMapping("/caretakers/me/payments")
    @PreAuthorize("hasRole('CARETAKER')")
    public ResponseEntity<PaymentResponse> recordForCaretaker(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody PaymentRecordRequest request) {
        PaymentResponse response = paymentService.recordForCaretaker(principal.id(), request);
        return ResponseEntity.created(URI.create("/api/payments/" + response.id())).body(response);
    }

    @PostMapping("/landlords/me/payments/batch")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<List<PaymentSummaryResponse>> recordBatch(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody PaymentBatchRecordRequest request) {
        return ResponseEntity.status(201).body(paymentService.recordBatch(principal.id(), request));
    }

    @GetMapping("/landlords/me/payments")
    @PreAuthorize("hasRole('LANDLORD')")
    public Page<PaymentSummaryResponse> searchForLandlord(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @ModelAttribute PaymentHistoryFilter filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return paymentService.searchForLandlord(principal.id(), filter, pageable);
    }

    @GetMapping("/caretakers/me/payments")
    @PreAuthorize("hasRole('CARETAKER')")
    public Page<PaymentSummaryResponse> searchForCaretaker(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @ModelAttribute PaymentHistoryFilter filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return paymentService.searchForCaretaker(principal.id(), filter, pageable);
    }

    @GetMapping("/landlords/me/payments/summary")
    @PreAuthorize("hasRole('LANDLORD')")
    public LandlordPaymentSummaryResponse landlordSummary(
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return paymentService.summaryForLandlord(principal.id());
    }

    @GetMapping("/caretakers/me/payments/summary")
    @PreAuthorize("hasRole('CARETAKER')")
    public LandlordPaymentSummaryResponse caretakerSummary(
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return paymentService.summaryForCaretaker(principal.id());
    }

    @GetMapping("/landlords/me/hostels/{hostelId}/payment-recorders")
    @PreAuthorize("hasRole('LANDLORD')")
    public HostelPaymentRecorderResponse listPaymentRecorders(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String hostelId) {
        return paymentService.listPaymentRecorders(principal.id(), hostelId);
    }

    @PatchMapping("/landlords/me/hostels/{hostelId}/payment-recorders")
    @PreAuthorize("hasRole('LANDLORD')")
    public HostelPaymentRecorderResponse setPaymentRecorder(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String hostelId,
            @Valid @RequestBody CaretakerPaymentPermissionRequest request) {
        return paymentService.setPaymentRecorder(principal.id(), hostelId, request);
    }
}
