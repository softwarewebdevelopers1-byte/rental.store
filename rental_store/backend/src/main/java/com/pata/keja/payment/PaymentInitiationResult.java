package com.pata.keja.payment;

public record PaymentInitiationResult(
        boolean accepted,
        String providerReference,
        String message) {
}
