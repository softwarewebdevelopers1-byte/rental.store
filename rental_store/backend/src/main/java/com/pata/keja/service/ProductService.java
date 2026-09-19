package com.pata.keja.service;

import com.pata.keja.dto.marketplace.ProductCreateRequest;
import com.pata.keja.dto.marketplace.ProductResponse;
import com.pata.keja.dto.marketplace.ProductSummaryResponse;
import com.pata.keja.dto.marketplace.ProductUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    Page<ProductSummaryResponse> search(String q, Pageable pageable);

    Page<ProductSummaryResponse> listByAgent(String agentId, Pageable pageable);

    Page<ProductSummaryResponse> listByCurrentAgent(Pageable pageable);

    ProductResponse getById(String productId);

    ProductResponse create(String agentId, ProductCreateRequest req);

    ProductResponse update(String productId, String requesterId, ProductUpdateRequest req);

    void deactivate(String productId, String requesterId);
}
