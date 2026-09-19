package com.pata.keja.service;

import com.pata.keja.dto.marketplace.PackCreateRequest;
import com.pata.keja.dto.marketplace.PackResponse;
import com.pata.keja.dto.marketplace.PackSummaryResponse;
import com.pata.keja.dto.marketplace.PackUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PackService {

    Page<PackSummaryResponse> search(String q, Pageable pageable);

    Page<PackSummaryResponse> listByAgent(String agentId, Pageable pageable);

    Page<PackSummaryResponse> listByCurrentAgent(Pageable pageable);

    PackResponse getById(String packId);

    PackResponse create(String agentId, PackCreateRequest req);

    PackResponse update(String packId, String requesterId, PackUpdateRequest req);

    void deactivate(String packId, String requesterId);
}
