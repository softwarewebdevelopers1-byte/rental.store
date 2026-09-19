package com.pata.keja.controller;

import java.net.URI;

import jakarta.validation.Valid;

import com.pata.keja.dto.invitation.InvitationCreateRequest;
import com.pata.keja.dto.invitation.InvitationRedeemResponse;
import com.pata.keja.dto.invitation.InvitationResponse;
import com.pata.keja.dto.invitation.InvitationSummaryResponse;
import com.pata.keja.dto.invitation.RedeemInvitationRequest;
import com.pata.keja.enums.InvitationKind;
import com.pata.keja.enums.InvitationStatus;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.InvitationService;

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

/** Invitation administration and public redemption — onboarding flows in the frontend. */
@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<InvitationSummaryResponse> list(
            @RequestParam(required = false) InvitationStatus status,
            @RequestParam(required = false) InvitationKind kind,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return invitationService.list(status, kind, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public InvitationResponse getById(@PathVariable String id) {
        return invitationService.getById(id);
    }

    @GetMapping("/token/{token}")
    public InvitationResponse getByToken(@PathVariable String token) {
        return invitationService.getByToken(token);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvitationResponse> create(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody InvitationCreateRequest request) {
        InvitationResponse response = invitationService.create(principal.id(), request);
        return ResponseEntity.created(URI.create("/api/invitations/" + response.id())).body(response);
    }

    @PostMapping("/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public InvitationResponse revoke(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return invitationService.revoke(id, principal.id());
    }

    @PostMapping("/token/{token}/redeem")
    public InvitationRedeemResponse redeem(
            @PathVariable String token,
            @Valid @RequestBody RedeemInvitationRequest request) {
        String userId = invitationService.redeem(
                token, request.name(), request.password(), request.businessName());
        return new InvitationRedeemResponse(userId);
    }
}
