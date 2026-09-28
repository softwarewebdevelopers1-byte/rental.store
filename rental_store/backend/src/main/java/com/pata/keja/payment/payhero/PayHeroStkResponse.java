package com.pata.keja.payment.payhero;

public record PayHeroStkResponse(
        boolean success,
        String message,
        String reference,
        String externalReference,
        String checkoutRequestId,
        String rawResponse) {
}
