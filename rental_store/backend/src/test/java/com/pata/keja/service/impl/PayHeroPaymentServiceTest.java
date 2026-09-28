package com.pata.keja.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.pata.keja.payment.PaymentProvider;
import com.pata.keja.payment.PaymentStatusResult;
import com.pata.keja.payment.payhero.PayHeroCallbackPayload;

class PayHeroPaymentServiceTest {

    @Test
    void failedStatusPollProcessesFailureForTheBooking() {
        PayHeroPaymentAttemptService attempts = mock(PayHeroPaymentAttemptService.class);
        PaymentProvider provider = mock(PaymentProvider.class);
        when(provider.name()).thenReturn("payhero");
        when(attempts.pendingStatusCheck("booking-1", "student-1"))
                .thenReturn(new PayHeroPaymentAttemptService.StatusCheck(
                        "booking-1", "BK-booking-1", 12500, "payhero-ref"));
        when(provider.checkStatus("payhero-ref"))
                .thenReturn(Optional.of(new PaymentStatusResult(
                        "FAILED", "transaction-id", "M-PESA-REF", null)));

        PayHeroPaymentService service = new PayHeroPaymentService(attempts, provider);
        service.refreshPendingStatus("booking-1", "student-1");

        ArgumentCaptor<PayHeroCallbackPayload> callback = ArgumentCaptor.forClass(PayHeroCallbackPayload.class);
        verify(attempts).processCallback(callback.capture());
        assertEquals("BK-booking-1", callback.getValue().externalReference());
        assertEquals("FAILED", callback.getValue().status());
        assertEquals(12500, callback.getValue().amount());
        assertEquals("M-PESA-REF", callback.getValue().reference());
        assertEquals("payhero-ref", callback.getValue().providerReference());
    }

    @Test
    void doesNotProcessQueuedStatus() {
        PayHeroPaymentAttemptService attempts = mock(PayHeroPaymentAttemptService.class);
        PaymentProvider provider = mock(PaymentProvider.class);
        when(provider.name()).thenReturn("payhero");
        when(attempts.pendingStatusCheck("booking-1", "student-1"))
                .thenReturn(new PayHeroPaymentAttemptService.StatusCheck(
                        "booking-1", "BK-booking-1", 12500, "payhero-ref"));
        when(provider.checkStatus("payhero-ref"))
                .thenReturn(Optional.of(new PaymentStatusResult(
                        "QUEUED", "transaction-id", null, null)));

        new PayHeroPaymentService(attempts, provider)
                .refreshPendingStatus("booking-1", "student-1");

        verify(attempts, org.mockito.Mockito.never()).processCallback(any());
    }
}
