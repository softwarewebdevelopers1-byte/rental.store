package com.pata.keja.service.impl;

import com.pata.keja.enums.UserRoles;
import com.pata.keja.dto.agent.MarketAgentCreateRequest;
import com.pata.keja.dto.agent.MarketAgentResponse;
import com.pata.keja.dto.agent.MarketAgentSummaryResponse;
import com.pata.keja.models.MarketAgent;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.MarketAgentMapper;
import com.pata.keja.repository.MarketAgentRepository;
import com.pata.keja.repository.UserRepository;
import com.pata.keja.security.CurrentUserProvider;
import com.pata.keja.service.MarketAgentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MarketAgentServiceImpl implements MarketAgentService {

    private final MarketAgentRepository agentRepo;
    private final UserRepository userRepo;
    private final MarketAgentMapper agentMapper;

    public MarketAgentServiceImpl(MarketAgentRepository agentRepo,
            UserRepository userRepo,
            MarketAgentMapper agentMapper) {
        this.agentRepo = agentRepo;
        this.userRepo = userRepo;
        this.agentMapper = agentMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MarketAgentSummaryResponse> list(Pageable pageable) {
        return agentRepo.findAll(pageable).map(agentMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketAgentResponse getCurrent() {
        return getById(CurrentUserProvider.requireUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public MarketAgentResponse getById(String agentId) {
        MarketAgent a = agentRepo.findById(agentId)
                .orElseThrow(() -> new NotFoundException("Market agent not found"));
        return agentMapper.toResponse(a);
    }

    @Override
    public MarketAgentResponse create(MarketAgentCreateRequest req) {
        if (userRepo.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already in use");
        }
        MarketAgent a = new MarketAgent();
        a.setName(req.name());
        a.setEmail(req.email().toLowerCase());
        a.setPhone(req.phone());
        a.setBusinessName(req.businessName());
        a.setRole(UserRoles.MARKET_AGENT);
        a.setActive(true);
        agentRepo.save(a);
        return agentMapper.toResponse(a);
    }

    @Override
    public void setActive(String agentId, boolean active) {
        MarketAgent a = agentRepo.findById(agentId)
                .orElseThrow(() -> new NotFoundException("Market agent not found"));
        a.setActive(active);
    }
}
