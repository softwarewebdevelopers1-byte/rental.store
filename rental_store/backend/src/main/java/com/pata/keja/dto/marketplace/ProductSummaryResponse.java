package com.pata.keja.dto.marketplace;

public record ProductSummaryResponse(
        String id,
        String agentId,
        String name,
        String description,
        long price,
        String imageUrl,
        boolean active) {
}
