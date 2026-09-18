package com.pata.keja.dto.invitation;

import com.pata.keja.enums.InvitationKind;
import com.pata.keja.enums.InvitationStatus;

import java.time.Instant;

public record InvitationSummaryResponse(
        String id,
        String token,
        InvitationKind kind,
        String email,
        InvitationStatus status,
        Instant createdAt,
        Instant expiresAt) {
}
