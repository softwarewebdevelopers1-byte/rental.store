package com.pata.keja.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pata.keja.exception.PaymentVerificationException;
import com.pata.keja.payment.payhero.PayHeroCallbackPayload;
import com.pata.keja.payment.payhero.PayHeroCallbackVerifier;
import com.pata.keja.service.impl.MarketplacePaymentService;
import com.pata.keja.service.impl.PayHeroPaymentService;

@RestController
@RequestMapping("/api/payments/payhero")
public class PayHeroCallbackController {

    private static final Logger log = LoggerFactory.getLogger(PayHeroCallbackController.class);

    private final PayHeroCallbackVerifier verifier;
    private final PayHeroPaymentService paymentService;
    private final MarketplacePaymentService marketplacePaymentService;

    public PayHeroCallbackController(
            PayHeroCallbackVerifier verifier,
            PayHeroPaymentService paymentService,
            MarketplacePaymentService marketplacePaymentService) {
        this.verifier = verifier;
        this.paymentService = paymentService;
        this.marketplacePaymentService = marketplacePaymentService;
    }

    @PostMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestBody String rawBody,
            @RequestHeader Map<String, String> headers) {
        try {
            verifier.verify(rawBody, headers);
            PayHeroCallbackPayload payload = verifier.parse(rawBody);
            if (payload.externalReference().startsWith("BK-")) {
                paymentService.handleCallback(payload);
            } else if (payload.externalReference().startsWith("ORDER-")) {
                marketplacePaymentService.handleCallback(payload);
            } else {
                throw new PaymentVerificationException("Callback reference is invalid");
            }
            return ResponseEntity.ok().build();
        } catch (PaymentVerificationException ex) {
            log.warn("PayHero callback verification failed: {}", ex.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
