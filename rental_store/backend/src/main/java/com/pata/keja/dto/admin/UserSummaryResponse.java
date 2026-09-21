package com.pata.keja.dto.admin;

import java.time.Instant;

import com.pata.keja.enums.UserRoles;

public record UserSummaryResponse(
        String id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        UserRoles role,
        boolean active,
        Instant createdAt) {
}
