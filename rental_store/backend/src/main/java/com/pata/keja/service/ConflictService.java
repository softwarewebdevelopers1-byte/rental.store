package com.pata.keja.service;

import com.pata.keja.dto.conflict.ConflictCreateRequest;
import com.pata.keja.dto.conflict.ConflictResolveRequest;
import com.pata.keja.dto.conflict.ConflictResponse;
import com.pata.keja.dto.conflict.ConflictSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ConflictService {

    ConflictResponse create(String studentId, String orderId, ConflictCreateRequest req);

    Page<ConflictSummaryResponse> listForStudent(String studentId, Pageable pageable);

    Page<ConflictSummaryResponse> listForAgent(String agentId, Pageable pageable);

    Page<ConflictSummaryResponse> listAll(Pageable pageable);

    ConflictResponse getById(String conflictId, String viewerId);

    ConflictResponse resolve(String conflictId, String adminId, ConflictResolveRequest req);
}
