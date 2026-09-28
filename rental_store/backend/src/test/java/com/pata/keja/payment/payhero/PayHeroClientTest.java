package com.pata.keja.payment.payhero;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import com.pata.keja.config.PayHeroProperties;

import tools.jackson.databind.ObjectMapper;

class PayHeroClientTest {

    @Test
    void postsStkPushToPayHeroPaymentsEndpoint() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        server.expect(requestTo("https://backend.payhero.co.ke/api/v2/payments"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(
                        """
                                {"success":true,"status":"QUEUED","reference":"payhero-ref"}
                                """,
                        MediaType.APPLICATION_JSON));

        PayHeroClient client = new PayHeroClient(
                new PayHeroProperties(
                        "https://backend.payhero.co.ke/api/v2",
                        "api-user",
                        "api-password",
                        "1234",
                        "https://example.com/api/payments/payhero/callback",
                        30),
                restTemplate,
                new ObjectMapper());

        PayHeroStkResponse result = client.initiateStkPush(
                12500, "+254712345678", "BK-booking-123");

        assertTrue(result.success());
        assertEquals("payhero-ref", result.reference());
        server.verify();
    }

    @Test
    void mapsClientRejectionToFailedInitiation() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        server.expect(requestTo("https://backend.payhero.co.ke/api/v2/payments"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators
                        .withBadRequest());

        PayHeroClient client = new PayHeroClient(
                new PayHeroProperties(
                        "https://backend.payhero.co.ke/api/v2",
                        "api-user",
                        "api-password",
                        "1234",
                        "https://example.com/api/payments/payhero/callback",
                        30),
                restTemplate,
                new ObjectMapper());

        PayHeroStkResponse result = client.initiateStkPush(
                12500, "+254712345678", "BK-booking-123");

        assertFalse(result.success());
        server.verify();
    }

    @Test
    void checksTransactionStatusByPayHeroReference() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        server.expect(requestTo(
                        "https://backend.payhero.co.ke/api/v2/transaction-status?reference=payhero-ref"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(
                        """
                                {
                                  "status": "SUCCESS",
                                  "reference": "payhero-ref",
                                  "provider_reference": "M-PESA-123",
                                  "transaction_date": "2026-09-28T12:00:00Z"
                                }
                                """,
                        MediaType.APPLICATION_JSON));

        PayHeroClient client = new PayHeroClient(
                new PayHeroProperties(
                        "https://backend.payhero.co.ke/api/v2",
                        "api-user",
                        "api-password",
                        "1234",
                        "",
                        30),
                restTemplate,
                new ObjectMapper());

        var result = client.getTransactionStatus("payhero-ref");

        assertEquals("SUCCESS", result.status());
        assertEquals("payhero-ref", result.reference());
        assertEquals("M-PESA-123", result.providerReference());
        server.verify();
    }

    @Test
    void normalizesAnyValidKenyanMpesanumber() {
        assertEquals("+254757475316", PayHeroPhoneNumber.normalize("0757 475 316"));
        assertEquals("+254757475316", PayHeroPhoneNumber.normalize("254757475316"));
        assertEquals("+254757475316", PayHeroPhoneNumber.normalize("+254 757 475 316"));
    }
}
