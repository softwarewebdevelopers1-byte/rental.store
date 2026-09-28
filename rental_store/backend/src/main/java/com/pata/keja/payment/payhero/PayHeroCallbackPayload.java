package com.pata.keja.payment.payhero;

import java.time.Instant;

public record PayHeroCallbackPayload(
        String externalReference,
        String status,
        long amount,
        String reference,
        String providerReference,
        Instant paidAt) {
}
