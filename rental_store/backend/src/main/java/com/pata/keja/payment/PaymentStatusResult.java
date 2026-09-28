package com.pata.keja.payment;

import java.time.Instant;

public record PaymentStatusResult(
        String status,
        String reference,
        String providerReference,
        Instant paidAt) {
}
