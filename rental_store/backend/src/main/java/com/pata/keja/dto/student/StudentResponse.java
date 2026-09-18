package com.pata.keja.dto.student;

import java.time.Instant;

import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.UserRoles;

public record StudentResponse(
        String id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        UserRoles role,
        boolean active,
        MembershipStatus membershipStatus,

        // Current tenancy
        String hostelId,
        String hostelName,
        String hostelLocation,
        String roomId,
        String roomNumber,
        Long roomPrice,

        // Pending request (may be null)
        String requestedHostelId,
        String requestedHostelName,
        String registrationHostelCode,

        Instant requestedAt,
        Instant activatedAt,
        Instant createdAt,
        Instant updatedAt) {
}
