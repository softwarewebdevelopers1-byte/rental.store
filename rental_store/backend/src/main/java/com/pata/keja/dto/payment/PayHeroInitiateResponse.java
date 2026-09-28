package com.pata.keja.dto.payment;

public record PayHeroInitiateResponse(
        String bookingRequestId,
        String paymentId,
        String providerReference,
        String status,
        String message) {
}
