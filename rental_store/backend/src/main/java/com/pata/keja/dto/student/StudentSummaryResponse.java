package com.pata.keja.dto.student;

import java.time.Instant;

import com.pata.keja.enums.MembershipStatus;

public record StudentSummaryResponse(
        String id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        boolean active,
        MembershipStatus membershipStatus,
        String hostelId,
        String hostelName,
        String roomId,
        String roomNumber,
        String requestedHostelId,
        String requestedHostelName,
        Instant createdAt) {
}
