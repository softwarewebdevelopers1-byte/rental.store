package com.pata.keja.dto.marketplace;

import java.time.Instant;

public record ProductResponse(
        String id,
        String agentId,
        String agentName,
        String name,
        String description,
        long price,
        String imageUrl,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
