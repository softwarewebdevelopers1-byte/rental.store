package com.pata.keja.dto.marketplace;

import java.time.Instant;
import java.util.List;

public record PackResponse(
        String id,
        String agentId,
        String agentName,
        String name,
        String description,
        long price,
        String imageUrl,
        List<PackItemResponse> items,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
