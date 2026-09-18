package com.pata.keja.mapper;

import com.pata.keja.dto.marketplace.PackItemResponse;
import com.pata.keja.dto.marketplace.PackResponse;
import com.pata.keja.dto.marketplace.PackSummaryResponse;
import com.pata.keja.models.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class PackMapper {

    public PackSummaryResponse toSummary(Pack p, Map<String, Product> productsById) {
        return new PackSummaryResponse(
                p.getId(),
                p.getAgent().getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                toItemResponses(p.getItems(), productsById),
                p.isActive());
    }

    public PackResponse toResponse(Pack p, Map<String, Product> productsById) {
        return new PackResponse(
                p.getId(),
                p.getAgent().getId(),
                p.getAgent().getName(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                toItemResponses(p.getItems(), productsById),
                p.isActive(),
                p.getCreatedAt(),
                p.getUpdatedAt());
    }

    private List<PackItemResponse> toItemResponses(List<PackItem> items, Map<String, Product> productsById) {
        return items.stream()
                .map(it -> {
                    Product prod = productsById.get(it.getProductId());
                    return new PackItemResponse(
                            it.getProductId(),
                            prod != null ? prod.getName() : "Unknown product",
                            prod != null ? prod.getPrice() : 0L,
                            it.getQuantity());
                })
                .toList();
    }
}
