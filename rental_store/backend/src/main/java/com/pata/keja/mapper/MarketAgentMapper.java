package com.pata.keja.mapper;

import com.pata.keja.dto.agent.MarketAgentResponse;
import com.pata.keja.dto.agent.MarketAgentSummaryResponse;
import com.pata.keja.models.MarketAgent;
import org.springframework.stereotype.Component;

@Component
public class MarketAgentMapper {

    public MarketAgentSummaryResponse toSummary(MarketAgent a) {
        return new MarketAgentSummaryResponse(
                a.getId(),
                a.getName(),
                a.getEmail(),
                a.getBusinessName(),
                a.isActive(),
                a.getCreatedAt());
    }

    public MarketAgentResponse toResponse(MarketAgent a) {
        return new MarketAgentResponse(
                a.getId(),
                a.getName(),
                a.getEmail(),
                a.getPhone(),
                a.getAvatarUrl(),
                a.getBusinessName(),
                a.getRole(),
                a.isActive(),
                a.getCreatedAt(),
                a.getUpdatedAt());
    }
}
