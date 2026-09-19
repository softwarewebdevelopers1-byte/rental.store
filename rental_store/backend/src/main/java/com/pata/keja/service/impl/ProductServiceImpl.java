package com.pata.keja.service.impl;

import com.pata.keja.dto.marketplace.ProductCreateRequest;
import com.pata.keja.dto.marketplace.ProductResponse;
import com.pata.keja.dto.marketplace.ProductSummaryResponse;
import com.pata.keja.dto.marketplace.ProductUpdateRequest;
import com.pata.keja.models.MarketAgent;
import com.pata.keja.models.Product;
import com.pata.keja.exception.AccessDeniedException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.ProductMapper;
import com.pata.keja.repository.MarketAgentRepository;
import com.pata.keja.repository.ProductRepository;
import com.pata.keja.service.ProductService;
import com.pata.keja.security.CurrentUserProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepo;
    private final MarketAgentRepository agentRepo;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepo,
            MarketAgentRepository agentRepo,
            ProductMapper productMapper) {
        this.productRepo = productRepo;
        this.agentRepo = agentRepo;
        this.productMapper = productMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> search(String q, Pageable pageable) {
        String needle = (q == null || q.isBlank()) ? null : q.trim();
        return productRepo.searchActive(needle, pageable).map(productMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> listByAgent(String agentId, Pageable pageable) {
        return productRepo.findAllByAgentId(agentId, pageable).map(productMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> listByCurrentAgent(Pageable pageable) {
        return listByAgent(CurrentUserProvider.requireUserId(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(String productId) {
        Product p = productRepo.findByIdWithAgent(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return productMapper.toResponse(p);
    }

    @Override
    public ProductResponse create(String agentId, ProductCreateRequest req) {
        MarketAgent agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new NotFoundException("Agent not found"));

        Product p = new Product();
        p.setAgent(agent);
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setImageUrl(req.imageUrl());
        p.setActive(true);
        productRepo.save(p);
        return productMapper.toResponse(p);
    }

    @Override
    public ProductResponse update(String productId, String requesterId, ProductUpdateRequest req) {
        Product p = productRepo.findByIdWithAgent(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (!p.getAgent().getId().equals(requesterId)) {
            throw new AccessDeniedException("You can only edit your own products");
        }
        if (req.name() != null)
            p.setName(req.name());
        if (req.description() != null)
            p.setDescription(req.description());
        if (req.price() != null)
            p.setPrice(req.price());
        if (req.imageUrl() != null)
            p.setImageUrl(req.imageUrl());
        if (req.active() != null)
            p.setActive(req.active());
        return productMapper.toResponse(p);
    }

    @Override
    public void deactivate(String productId, String requesterId) {
        Product p = productRepo.findByIdWithAgent(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (!p.getAgent().getId().equals(requesterId)) {
            throw new AccessDeniedException("You can only deactivate your own products");
        }
        p.setActive(false);
    }
}
