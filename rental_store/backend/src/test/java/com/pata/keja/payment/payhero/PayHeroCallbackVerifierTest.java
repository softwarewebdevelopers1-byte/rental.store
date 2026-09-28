package com.pata.keja.payment.payhero;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.Test;

import com.pata.keja.repository.BookingRequestRepository;
import com.pata.keja.repository.OrderRepository;

import tools.jackson.databind.ObjectMapper;

class PayHeroCallbackVerifierTest {

    private final PayHeroCallbackVerifier verifier = new PayHeroCallbackVerifier(
            new ObjectMapper(),
            mock(BookingRequestRepository.class),
            mock(OrderRepository.class));

    @Test
    void parsesPayHeroSuccessCallback() {
        PayHeroCallbackPayload payload = verifier.parse("""
                {
                  "status": true,
                  "response": {
                    "Amount": 12500,
                    "ExternalReference": "BK-booking-123",
                    "MpesaReceiptNumber": "QWE123",
                    "CheckoutRequestID": "checkout-123",
                    "ResultCode": 0,
                    "Status": "Success"
                  }
                }
                """);

        assertEquals("BK-booking-123", payload.externalReference());
        assertEquals("SUCCESS", payload.status());
        assertEquals(12500, payload.amount());
        assertEquals("QWE123", payload.reference());
        assertEquals("checkout-123", payload.providerReference());
    }

    @Test
    void parsesPayHeroFailedCallback() {
        PayHeroCallbackPayload payload = verifier.parse("""
                {
                  "status": true,
                  "response": {
                    "Amount": 12500,
                    "ExternalReference": "BK-booking-123",
                    "ResultCode": 1032,
                    "ResultDesc": "Request cancelled by user",
                    "Status": "Failed"
                  }
                }
                """);

        assertEquals("FAILED", payload.status());
        assertEquals(12500, payload.amount());
    }
}
