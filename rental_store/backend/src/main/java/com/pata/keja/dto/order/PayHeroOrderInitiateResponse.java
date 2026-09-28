package com.pata.keja.dto.order;

public record PayHeroOrderInitiateResponse(
        String orderId,
        String providerReference,
        String status,
        String message) {
}
