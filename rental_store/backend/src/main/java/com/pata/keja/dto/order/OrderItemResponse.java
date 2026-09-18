package com.pata.keja.dto.order;

public record OrderItemResponse(
        String kind,
        String refId,
        String name,
        long unitPrice,
        int quantity,
        long lineTotal) {
}
