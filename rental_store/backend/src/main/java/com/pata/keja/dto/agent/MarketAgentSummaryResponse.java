package com.pata.keja.dto.agent;

import java.time.Instant;

public record MarketAgentSummaryResponse(
        String id,
        String name,
        String email,
        String businessName,
        boolean active,
        Instant createdAt) {
}
