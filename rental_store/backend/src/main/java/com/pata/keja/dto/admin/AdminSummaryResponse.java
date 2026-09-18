package com.pata.keja.dto.admin;

import java.time.Instant;

public record AdminSummaryResponse(
        String id,
        String name,
        String email,
        boolean active,
        Instant createdAt) {
}
