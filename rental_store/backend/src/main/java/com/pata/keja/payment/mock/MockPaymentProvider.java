package com.pata.keja.payment.mock;

import org.springframework.stereotype.Component;

import com.pata.keja.payment.PaymentInitiationResult;
import com.pata.keja.payment.PaymentProvider;

@Component
public class MockPaymentProvider implements PaymentProvider {

    @Override
    public PaymentInitiationResult initiate(long amount, String phone, String externalReference) {
        return new PaymentInitiationResult(
                true,
                "MOCK-" + externalReference,
                "Mock payment accepted");
    }

    @Override
    public String name() {
        return "mock";
    }
}
