package com.pata.keja.service.impl;

import com.pata.keja.dto.marketplace.*;
import com.pata.keja.models.MarketAgent;
import com.pata.keja.models.Pack;
import com.pata.keja.models.PackItem;
import com.pata.keja.models.Product;
import com.pata.keja.exception.AccessDeniedException;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.PackMapper;
import com.pata.keja.repository.MarketAgentRepository;
import com.pata.keja.repository.PackRepository;
import com.pata.keja.repository.ProductRepository;
import com.pata.keja.service.PackService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class PackServiceImpl implements PackService {

    private final PackRepository packRepo;
    private final ProductRepository productRepo;
    private final MarketAgentRepository agentRepo;
    private final PackMapper packMapper;

    public PackServiceImpl(PackRepository packRepo,
            ProductRepository productRepo,
            MarketAgentRepository agentRepo,
            PackMapper packMapper) {
        this.packRepo = packRepo;
        this.productRepo = productRepo;
        this.agentRepo = agentRepo;
        this.packMapper = packMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PackSummaryResponse> search(String q, Pageable pageable) {
        String needle = (q == null || q.isBlank()) ? null : q.trim();
        Page<Pack> page = packRepo.searchActive(needle, pageable);
        return page.map(p -> packMapper.toSummary(p, loadProductsById(p)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PackSummaryResponse> listByAgent(String agentId, Pageable pageable) {
        Page<Pack> page = packRepo.findAllByAgentId(agentId, pageable);
        return page.map(p -> packMapper.toSummary(p, loadProductsById(p)));
    }

    @Override
    @Transactional(readOnly = true)
    public PackResponse getById(String packId) {
        Pack p = packRepo.findByIdWithItems(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));
        return packMapper.toResponse(p, loadProductsById(p));
    }

    @Override
    public PackResponse create(String agentId, PackCreateRequest req) {
        MarketAgent agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new NotFoundException("Agent not found"));

        Pack pack = new Pack();
        pack.setAgent(agent);
        pack.setName(req.name());
        pack.setDescription(req.description());
        pack.setPrice(req.price());
        pack.setImageUrl(req.imageUrl());
        pack.setActive(true);
        pack.setItems(toPackItems(agentId, req.items()));
        packRepo.save(pack);
        return packMapper.toResponse(pack, loadProductsById(pack));
    }

    @Override
    public PackResponse update(String packId, String requesterId, PackUpdateRequest req) {
        Pack pack = packRepo.findByIdWithItems(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        if (!pack.getAgent().getId().equals(requesterId)) {
            throw new AccessDeniedException("You can only edit your own packs");
        }
        if (req.name() != null)
            pack.setName(req.name());
        if (req.description() != null)
            pack.setDescription(req.description());
        if (req.price() != null)
            pack.setPrice(req.price());
        if (req.imageUrl() != null)
            pack.setImageUrl(req.imageUrl());
        if (req.active() != null)
            pack.setActive(req.active());
        if (req.items() != null) {
            pack.getItems().clear();
            pack.getItems().addAll(toPackItems(requesterId, req.items()));
        }
        return packMapper.toResponse(pack, loadProductsById(pack));
    }

    @Override
    public void deactivate(String packId, String requesterId) {
        Pack p = packRepo.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));
        if (!p.getAgent().getId().equals(requesterId)) {
            throw new AccessDeniedException("You can only deactivate your own packs");
        }
        p.setActive(false);
    }

    // ---------- helpers ----------

    /**
     * Validates that all products belong to the requesting agent, then converts to
     * PackItem.
     */
    private List<PackItem> toPackItems(String agentId, List<PackItemRequest> items) {
        List<PackItem> result = new ArrayList<>();
        for (PackItemRequest it : items) {
            Product p = productRepo.findByIdWithAgent(it.productId())
                    .orElseThrow(() -> new NotFoundException("Product not found: " + it.productId()));
            if (!p.getAgent().getId().equals(agentId)) {
                throw new ConflictException("You can only include your own products in a pack");
            }
            result.add(new PackItem(p.getId(), it.quantity()));
        }
        return result;
    }

    private Map<String, Product> loadProductsById(Pack pack) {
        List<String> ids = pack.getItems().stream().map(PackItem::getProductId).toList();
        return productRepo.findAllById(ids).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
    }
}
