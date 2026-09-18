package com.pata.keja.dto.admin;

import com.pata.keja.enums.UserRoles;

import java.time.Instant;

public record AdminResponse(
        String id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        UserRoles role,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
