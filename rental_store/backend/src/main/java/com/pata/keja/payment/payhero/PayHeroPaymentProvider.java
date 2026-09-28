package com.pata.keja.payment.payhero;

import org.springframework.stereotype.Component;

import com.pata.keja.payment.PaymentInitiationResult;
import com.pata.keja.payment.PaymentStatusResult;
import com.pata.keja.payment.PaymentProvider;

@Component
public class PayHeroPaymentProvider implements PaymentProvider {

    private final PayHeroClient client;

    public PayHeroPaymentProvider(PayHeroClient client) {
        this.client = client;
    }

    @Override
    public void validateConfiguration() {
        client.validateConfiguration();
    }

    @Override
    public PaymentInitiationResult initiate(long amount, String phone, String externalReference) {
        PayHeroStkResponse response = client.initiateStkPush(amount, phone, externalReference);
        String providerReference = response.reference() != null
                ? response.reference()
                : response.checkoutRequestId();
        if (response.success() && (providerReference == null || providerReference.isBlank())) {
            throw new com.pata.keja.exception.PaymentProviderException(
                    "PayHero response did not include a transaction reference");
        }
        return new PaymentInitiationResult(response.success(), providerReference, response.message());
    }

    @Override
    public java.util.Optional<PaymentStatusResult> checkStatus(String reference) {
        return java.util.Optional.of(client.getTransactionStatus(reference));
    }

    @Override
    public String name() {
        return "payhero";
    }
}
