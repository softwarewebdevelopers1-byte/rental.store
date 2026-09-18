package com.pata.keja.dto.landlord;

import java.time.Instant;

import com.pata.keja.enums.VerificationStatus;

import java.time.Instant;

public record LandlordSummaryResponse(
        String id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        boolean active,
        VerificationStatus verificationStatus,
        int hostelCount,
        Instant createdAt) {
}
