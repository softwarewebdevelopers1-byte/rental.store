package com.pata.keja.dto.agent;

import com.pata.keja.enums.UserRoles;

import java.time.Instant;

public record MarketAgentResponse(
        String id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        String businessName,
        UserRoles role,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
