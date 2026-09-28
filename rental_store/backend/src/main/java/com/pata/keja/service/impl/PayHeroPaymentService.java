package com.pata.keja.service.impl;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.pata.keja.dto.payment.PayHeroInitiateRequest;
import com.pata.keja.dto.payment.PayHeroInitiateResponse;
import com.pata.keja.exception.PaymentProviderException;
import com.pata.keja.payment.PaymentInitiationResult;
import com.pata.keja.payment.PaymentProvider;
import com.pata.keja.payment.PaymentStatusResult;
import com.pata.keja.payment.payhero.PayHeroCallbackPayload;

@Service
public class PayHeroPaymentService {

    private static final Logger log = LoggerFactory.getLogger(PayHeroPaymentService.class);

    private final PayHeroPaymentAttemptService attemptService;
    private final PaymentProvider paymentProvider;

    public PayHeroPaymentService(
            PayHeroPaymentAttemptService attemptService,
            PaymentProvider paymentProvider) {
        this.attemptService = attemptService;
        this.paymentProvider = paymentProvider;
    }

    public PayHeroInitiateResponse initiateStkPush(
            String studentId,
            PayHeroInitiateRequest request) {
        PayHeroPaymentAttemptService.Attempt attempt = attemptService.prepare(studentId, request);
        if (!attempt.shouldInitiate()) {
            return attempt.response();
        }
        try {
            paymentProvider.validateConfiguration();
        } catch (PaymentProviderException ex) {
            return attemptService.rejected(attempt, ex.getMessage());
        }
        PaymentInitiationResult result = paymentProvider.initiate(
                attempt.amount(), attempt.phone(), attempt.externalReference());
        if (!result.accepted()) {
            return attemptService.rejected(attempt,
                    result.message() == null || result.message().isBlank()
                            ? "Payment provider rejected the request"
                            : result.message());
        }
        if (result.providerReference() == null || result.providerReference().isBlank()) {
            throw new PaymentProviderException("Payment provider did not return a transaction reference");
        }
        return attemptService.accepted(
                attempt,
                result.providerReference(),
                result.message() == null ? "STK push accepted" : result.message());
    }

    public void refreshPendingStatus(String bookingId, String studentId) {
        if (!"payhero".equalsIgnoreCase(paymentProvider.name())) {
            return;
        }
        PayHeroPaymentAttemptService.StatusCheck statusCheck =
                attemptService.pendingStatusCheck(bookingId, studentId);
        if (statusCheck == null) {
            return;
        }

        try {
            Optional<PaymentStatusResult> statusResult =
                    paymentProvider.checkStatus(statusCheck.payheroReference());
            if (statusResult.isEmpty()) {
                return;
            }
            PaymentStatusResult status = statusResult.get();
            if (!status.status().equals("SUCCESS") && !status.status().equals("FAILED")) {
                return;
            }
            attemptService.processCallback(new PayHeroCallbackPayload(
                    statusCheck.externalReference(),
                    status.status(),
                    statusCheck.amount(),
                    status.providerReference(),
                    statusCheck.payheroReference(),
                    status.paidAt()));
        } catch (PaymentProviderException ex) {
            log.warn("Unable to check PayHero payment status for booking {}: {}", bookingId, ex.getMessage());
        }
    }

    public void handleCallback(PayHeroCallbackPayload callback) {
        attemptService.processCallback(callback);
    }
}
