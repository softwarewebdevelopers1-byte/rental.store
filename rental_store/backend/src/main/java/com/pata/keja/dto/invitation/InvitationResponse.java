package com.pata.keja.dto.invitation;

import com.pata.keja.enums.InvitationKind;
import com.pata.keja.enums.InvitationStatus;

import java.time.Instant;

public record InvitationResponse(
        String id,
        String token,
        InvitationKind kind,
        String email,
        InvitationStatus status,

        String createdById,
        String createdByName,
        String usedById,
        String usedByName,

        Instant createdAt,
        Instant expiresAt,
        Instant usedAt,
        Instant revokedAt) {
}
