package com.pata.keja.payment.payhero;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import com.pata.keja.exception.PaymentVerificationException;
import com.pata.keja.enums.OrderStatus;
import com.pata.keja.enums.BookingRequestStatus;
import com.pata.keja.models.BookingRequest;
import com.pata.keja.models.Order;
import com.pata.keja.models.Payment;
import com.pata.keja.repository.BookingRequestRepository;
import com.pata.keja.repository.OrderRepository;

@Component
public class PayHeroCallbackVerifier {

    private final ObjectMapper objectMapper;
    private final BookingRequestRepository bookingRequestRepository;
    private final OrderRepository orderRepository;

    public PayHeroCallbackVerifier(
            ObjectMapper objectMapper,
            BookingRequestRepository bookingRequestRepository,
            OrderRepository orderRepository) {
        this.objectMapper = objectMapper;
        this.bookingRequestRepository = bookingRequestRepository;
        this.orderRepository = orderRepository;
    }

    public void verify(String rawBody, Map<String, String> headers) {
        PayHeroCallbackPayload payload = parse(rawBody);
        if (payload.externalReference().startsWith("BK-")) {
            BookingRequest booking = findBooking(payload.externalReference());
            Payment payment = booking.getPayment();
            if (payment == null) {
                throw new PaymentVerificationException("Callback has no payment for the booking");
            }
            if (payment.getStatus() != com.pata.keja.enums.PaymentStatus.PENDING
                    && payment.getStatus() != com.pata.keja.enums.PaymentStatus.PAID
                    && payment.getStatus() != com.pata.keja.enums.PaymentStatus.FAILED) {
                throw new PaymentVerificationException("Callback payment is not processable");
            }
            if (payment.getAmount() != payload.amount()) {
                throw new PaymentVerificationException("Callback amount does not match the payment");
            }
            if (payment.getStatus() == com.pata.keja.enums.PaymentStatus.PENDING
                    && booking.getStatus() != BookingRequestStatus.PENDING) {
                throw new PaymentVerificationException("Callback booking is no longer pending");
            }
        } else if (payload.externalReference().startsWith("ORDER-")) {
            Order order = findOrder(payload.externalReference());
            if (order.getStatus() != OrderStatus.PENDING_PAYMENT
                    && order.getStatus() != OrderStatus.PAID
                    && order.getStatus() != OrderStatus.CANCELLED) {
                throw new PaymentVerificationException("Callback order is not processable");
            }
            if (order.getTotal() != payload.amount()) {
                throw new PaymentVerificationException("Callback amount does not match the order");
            }
        }

        // PayHero does not document a signed callback header for this integration.
        // The DB reference and exact amount checks above are therefore mandatory.
        // Keep the header parameter in the contract so a documented signature can be
        // added without changing the public callback endpoint.
        if (headers == null) {
            return;
        }
    }

    public PayHeroCallbackPayload parse(String rawBody) {
        if (rawBody == null || rawBody.isBlank()) {
            throw new PaymentVerificationException("Callback body is empty");
        }
        try {
            JsonNode root = objectMapper.readTree(rawBody);
            JsonNode response = root.get("response");
            JsonNode details = response != null && response.isObject() ? response : root;
            String externalReference = firstText(
                    details, "ExternalReference", "external_reference", "externalReference");
            if (externalReference == null) {
                externalReference = firstText(root, "external_reference", "externalReference");
            }
            if (externalReference == null
                    || (!externalReference.startsWith("BK-") && !externalReference.startsWith("ORDER-"))) {
                throw new PaymentVerificationException("Callback reference is invalid");
            }
            String status = firstText(details, "Status", "payment_status", "status");
            if (status == null && root.get("status") != null && !root.get("status").isBoolean()) {
                status = root.get("status").asText(null);
            }
            if (status == null) {
                throw new PaymentVerificationException("Callback status is missing");
            }
            status = status.toUpperCase(Locale.ROOT);
            if (!status.equals("SUCCESS") && !status.equals("FAILED")) {
                throw new PaymentVerificationException("Callback status is not final");
            }
            JsonNode successNode = details.get("success");
            if (successNode == null) {
                successNode = root.get("success");
            }
            if (successNode != null && successNode.isBoolean()
                    && successNode.booleanValue() != status.equals("SUCCESS")) {
                throw new PaymentVerificationException("Callback status is inconsistent");
            }
            long amount = longAmount(first(details, "Amount", "amount"));
            String reference = firstText(details, "reference", "MpesaReceiptNumber");
            String providerReference = firstText(
                    details, "provider_reference", "providerReference",
                    "CheckoutRequestID", "MerchantRequestID");
            String transactionType = firstText(details, "transaction_type", "transactionType");
            if (transactionType != null && !transactionType.equalsIgnoreCase("inbound_payment")) {
                throw new PaymentVerificationException("Callback is not an inbound payment");
            }
            Instant paidAt = instant(firstText(
                    details, "paid_at", "paidAt", "transaction_date", "transactionDate"));
            return new PayHeroCallbackPayload(
                    externalReference,
                    status,
                    amount,
                    reference,
                    providerReference,
                    paidAt);
        } catch (PaymentVerificationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new PaymentVerificationException("Callback body is invalid", ex);
        }
    }

    private BookingRequest findBooking(String externalReference) {
        String bookingId = externalReference.substring("BK-".length());
        if (bookingId.isBlank()) {
            throw new PaymentVerificationException("Callback booking reference is empty");
        }
        return bookingRequestRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new PaymentVerificationException("Callback booking reference is unknown"));
    }

    private Order findOrder(String externalReference) {
        String orderId = externalReference.substring("ORDER-".length());
        if (orderId.isBlank()) {
            throw new PaymentVerificationException("Callback order reference is empty");
        }
        return orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new PaymentVerificationException("Callback order reference is unknown"));
    }

    private static long longAmount(JsonNode node) {
        if (node == null || node.isNull()) {
            throw new PaymentVerificationException("Callback amount is missing");
        }
        try {
            return new BigDecimal(node.asText()).longValueExact();
        } catch (ArithmeticException | NumberFormatException ex) {
            throw new PaymentVerificationException("Callback amount is invalid", ex);
        }
    }

    private static JsonNode first(JsonNode root, String... names) {
        for (String name : names) {
            JsonNode node = root.get(name);
            if (node != null && !node.isNull()) {
                return node;
            }
        }
        return null;
    }

    private static String firstText(JsonNode root, String... names) {
        JsonNode node = first(root, names);
        if (node == null) {
            return null;
        }
        String value = node.asText(null);
        return value == null || value.isBlank() ? null : value;
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
