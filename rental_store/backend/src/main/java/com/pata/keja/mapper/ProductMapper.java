package com.pata.keja.mapper;

import com.pata.keja.dto.marketplace.ProductResponse;
import com.pata.keja.dto.marketplace.ProductSummaryResponse;
import com.pata.keja.models.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductSummaryResponse toSummary(Product p) {
        return new ProductSummaryResponse(
                p.getId(),
                p.getAgent().getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                p.isActive());
    }

    public ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getAgent().getId(),
                p.getAgent().getName(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                p.isActive(),
                p.getCreatedAt(),
                p.getUpdatedAt());
    }
}
