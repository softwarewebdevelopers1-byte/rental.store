package com.pata.keja.dto.marketplace;

public record PackItemResponse(
        String productId,
        String productName,
        long unitPrice,
        int quantity) {
}
