package com.pata.keja.payment.payhero;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.net.URI;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.pata.keja.config.PayHeroProperties;
import com.pata.keja.exception.PaymentProviderException;
import com.pata.keja.payment.PaymentStatusResult;

@Component
public class PayHeroClient {

    private static final Logger log = LoggerFactory.getLogger(PayHeroClient.class);

    private final PayHeroProperties props;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PayHeroClient(
            PayHeroProperties props,
            RestTemplate restTemplate,
            ObjectMapper objectMapper) {
        this.props = props;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public PayHeroStkResponse initiateStkPush(
            long amount,
            String phoneE164,
            String externalReference) {
        validateConfiguration();

        String phone = phoneE164.startsWith("+")
                ? phoneE164.substring(1)
                : phoneE164;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", amount);
        body.put("phone_number", phone);
        body.put("channel_id", props.channelId());
        body.put("provider", "m-pesa");
        body.put("external_reference", externalReference);
        if (props.callbackUrl() != null && !props.callbackUrl().isBlank()) {
            body.put("callback_url", props.callbackUrl());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(props.username(), props.password(), StandardCharsets.UTF_8);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    props.baseUrl().replaceAll("/$", "") + "/payments",
                    new HttpEntity<>(body, headers),
                    String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("PayHero returned HTTP status {}", response.getStatusCode().value());
                throw new PaymentProviderException(
                        "PayHero returned " + response.getStatusCode().value());
            }
            return parseResponse(response.getBody(), externalReference);
        } catch (HttpStatusCodeException ex) {
            log.warn("PayHero returned HTTP status {}", ex.getStatusCode().value());
            if (ex.getStatusCode().is4xxClientError()) {
                return new PayHeroStkResponse(
                        false,
                        "PayHero rejected the STK request (HTTP " + ex.getStatusCode().value() + ")",
                        null,
                        externalReference,
                        null,
                        null);
            }
            throw new PaymentProviderException(
                    "PayHero returned " + ex.getStatusCode().value(), ex);
        } catch (PaymentProviderException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new PaymentProviderException("PayHero request failed", ex);
        }
    }

    public PaymentStatusResult getTransactionStatus(String reference) {
        validateConfiguration();
        if (reference == null || reference.isBlank()) {
            throw new PaymentProviderException("PayHero transaction reference is missing");
        }

        URI uri = UriComponentsBuilder
                .fromUriString(props.baseUrl().replaceAll("/$", "") + "/transaction-status")
                .queryParam("reference", reference)
                .build()
                .encode()
                .toUri();
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(props.username(), props.password(), StandardCharsets.UTF_8);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    uri, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new PaymentProviderException(
                        "PayHero returned " + response.getStatusCode().value());
            }
            return parseTransactionStatus(response.getBody(), reference);
        } catch (HttpStatusCodeException ex) {
            throw new PaymentProviderException(
                    "PayHero status check returned " + ex.getStatusCode().value(), ex);
        } catch (PaymentProviderException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new PaymentProviderException("PayHero status check failed", ex);
        }
    }

    private PaymentStatusResult parseTransactionStatus(String rawResponse, String requestedReference) {
        if (rawResponse == null || rawResponse.isBlank()) {
            throw new PaymentProviderException("PayHero returned an empty status response");
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String status = text(first(root, "status", "Status"));
            if (status == null) {
                throw new PaymentProviderException("PayHero status response is missing status");
            }
            status = status.toUpperCase(Locale.ROOT);
            if (!status.equals("QUEUED") && !status.equals("PENDING") && !status.equals("PROCESSING")
                    && !status.equals("SUCCESS") && !status.equals("FAILED")) {
                throw new PaymentProviderException("PayHero returned an unknown payment status");
            }
            String responseReference = text(first(root, "reference", "transaction_reference"));
            if (responseReference == null) {
                responseReference = requestedReference;
            }
            String providerReference = text(first(
                    root, "provider_reference", "third_party_reference", "MpesaReceiptNumber"));
            String paidAtText = text(first(root, "transaction_date", "paid_at", "paidAt"));
            return new PaymentStatusResult(
                    status,
                    responseReference,
                    providerReference,
                    instant(paidAtText));
        } catch (PaymentProviderException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new PaymentProviderException("PayHero returned an invalid status response", ex);
        }
    }

    private PayHeroStkResponse parseResponse(String rawResponse, String requestedExternalReference) {
        if (rawResponse == null || rawResponse.isBlank()) {
            throw new PaymentProviderException("PayHero returned an empty response");
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode statusNode = first(root, "status");
            JsonNode successNode = first(root, "success");
            boolean success = accepted(successNode, statusNode, root);
            String message = text(first(root, "message", "error_message", "error"));
            String reference = text(first(root,
                    "reference", "provider_reference", "transaction_id", "transactionId"));
            String externalReference = text(first(root,
                    "external_reference", "externalReference"));
            if (externalReference == null) {
                externalReference = requestedExternalReference;
            }
            String checkoutRequestId = text(first(root,
                    "checkout_request_id", "checkoutRequestId", "CheckoutRequestID"));
            if (message == null) {
                message = success ? "STK push accepted" : "PayHero rejected the STK push";
            }
            return new PayHeroStkResponse(
                    success,
                    message,
                    reference,
                    externalReference,
                    checkoutRequestId,
                    rawResponse);
        } catch (Exception ex) {
            if (ex instanceof PaymentProviderException providerException) {
                throw providerException;
            }
            throw new PaymentProviderException("PayHero returned an invalid response", ex);
        }
    }

    private static boolean accepted(JsonNode successNode, JsonNode statusNode, JsonNode root) {
        if (successNode != null && successNode.isBoolean()) {
            return successNode.booleanValue();
        }
        if (statusNode != null) {
            if (statusNode.isBoolean()) {
                return statusNode.booleanValue();
            }
            String status = statusNode.asText("").toLowerCase(Locale.ROOT);
            if (status.equals("failed") || status.equals("failure")
                    || status.equals("rejected") || status.equals("error")
                    || status.equals("cancelled")) {
                return false;
            }
            if (status.equals("success") || status.equals("successful")
                    || status.equals("initiated") || status.equals("queued")
                    || status.equals("pending") || status.equals("processing")) {
                return true;
            }
        }
        return !root.has("error") && !root.has("error_message");
    }

    private static JsonNode first(JsonNode root, String... names) {
        for (String name : names) {
            JsonNode direct = root.get(name);
            if (direct != null && !direct.isNull()) {
                return direct;
            }
            JsonNode data = root.get("data");
            if (data != null && data.isObject()) {
                JsonNode nested = data.get(name);
                if (nested != null && !nested.isNull()) {
                    return nested;
                }
            }
        }
        return null;
    }

    private static String text(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        String value = node.asText(null);
        return value == null || value.isBlank() ? null : value;
    }

    public void validateConfiguration() {
        if (props.baseUrl() == null || props.baseUrl().isBlank()
                || props.username() == null || props.username().isBlank()
                || props.password() == null || props.password().isBlank()
                || props.channelId() == null || props.channelId().isBlank()) {
            throw new PaymentProviderException("PayHero configuration is incomplete");
        }
    }

    private static Instant instant(String value) {
        if (value == null) {
            return null;
        }
        try {
            return Instant.parse(value);
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
