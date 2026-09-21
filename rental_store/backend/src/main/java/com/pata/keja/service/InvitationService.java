package com.pata.keja.service;

import com.pata.keja.enums.InvitationKind;
import com.pata.keja.enums.InvitationStatus;
import com.pata.keja.dto.invitation.InvitationCreateRequest;
import com.pata.keja.dto.invitation.InvitationResponse;
import com.pata.keja.dto.invitation.InvitationSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InvitationService {

    Page<InvitationSummaryResponse> list(InvitationStatus status,
            InvitationKind kind,
            Pageable pageable);

    InvitationResponse getById(String invitationId);

    /** Look up by token — used by the public "redeem invitation" page. */
    InvitationResponse getByToken(String token);

    InvitationResponse create(String adminId, InvitationCreateRequest req);

    /** Return the active caretaker link for this hostel, or create one. */
    InvitationResponse createForLandlord(String landlordId, String hostelId);

    InvitationResponse revoke(String invitationId, String adminId);

    /**
     * Redeem an invitation. Called after the invitee submits their details
     * (name, password). Creates the appropriate user, marks the invitation
     * as USED, and returns the new user's id (as a plain string so we don't
     * leak entity classes through the service interface).
     */
    String redeem(String token, String name, String email, String password, String businessName);

    int expireOverdueInvitations();
}
