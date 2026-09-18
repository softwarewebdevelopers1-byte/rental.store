package com.pata.keja.dto.marketplace;

import java.util.List;

public record PackSummaryResponse(
        String id,
        String agentId,
        String name,
        String description,
        long price,
        String imageUrl,
        List<PackItemResponse> items,
        boolean active) {
}
