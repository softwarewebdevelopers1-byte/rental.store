package com.pata.keja.service;

import com.pata.keja.dto.agent.MarketAgentCreateRequest;
import com.pata.keja.dto.agent.MarketAgentResponse;
import com.pata.keja.dto.agent.MarketAgentSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MarketAgentService {

    Page<MarketAgentSummaryResponse> list(Pageable pageable);

    MarketAgentResponse getById(String agentId);

    MarketAgentResponse create(MarketAgentCreateRequest req);

    void setActive(String agentId, boolean active);
}
