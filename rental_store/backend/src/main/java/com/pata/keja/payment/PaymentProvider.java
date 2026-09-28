package com.pata.keja.payment;

import java.util.Optional;

public interface PaymentProvider {

    default void validateConfiguration() {
    }

    PaymentInitiationResult initiate(long amount, String phone, String externalReference);

    default Optional<PaymentStatusResult> checkStatus(String reference) {
        return Optional.empty();
    }

    String name();
}
