package com.pata.keja.dto.landlord;

import java.time.Instant;
import java.util.List;

import com.pata.keja.enums.UserRoles;
import com.pata.keja.enums.VerificationStatus;

public record LandlordResponse(
        String id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        UserRoles role,
        boolean active,
        VerificationStatus verificationStatus,
        Instant verificationRequestedAt,
        Instant verificationDecidedAt,
        String verificationNotes,
        List<?> hostels,
        Instant createdAt,
        Instant updatedAt) {
}
