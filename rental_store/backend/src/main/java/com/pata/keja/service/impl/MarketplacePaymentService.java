package com.pata.keja.service.impl;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pata.keja.dto.order.PayHeroOrderInitiateRequest;
import com.pata.keja.dto.order.PayHeroOrderInitiateResponse;
import com.pata.keja.enums.NotificationKind;
import com.pata.keja.enums.OrderStatus;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.exception.PaymentProviderException;
import com.pata.keja.models.Order;
import com.pata.keja.payment.PaymentInitiationResult;
import com.pata.keja.payment.PaymentProvider;
import com.pata.keja.payment.payhero.PayHeroCallbackPayload;
import com.pata.keja.payment.payhero.PayHeroPhoneNumber;
import com.pata.keja.repository.OrderRepository;
import com.pata.keja.service.NotificationService;

@Service
@Transactional
public class MarketplacePaymentService {

    private final OrderRepository orderRepository;
    private final PaymentProvider paymentProvider;
    private final NotificationService notificationService;

    public MarketplacePaymentService(
            OrderRepository orderRepository,
            PaymentProvider paymentProvider,
            NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.paymentProvider = paymentProvider;
        this.notificationService = notificationService;
    }

    public PayHeroOrderInitiateResponse initiate(
            String studentId,
            String orderId,
            PayHeroOrderInitiateRequest request) {
        Order order = orderRepository.findByIdWithDetailsForUpdate(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        if (!order.getStudent().getId().equals(studentId)) {
            throw new ConflictException("You do not own this order.");
        }
        if (order.getStatus() == OrderStatus.PAID) {
            return new PayHeroOrderInitiateResponse(
                    order.getId(), order.getPayheroReference(), "PAID", "Payment has already been received");
        }
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new ConflictException("This order is no longer awaiting payment.");
        }

        String phone = PayHeroPhoneNumber.normalize(request.phone());

        if (order.getPayheroReference() != null && !order.getPayheroReference().isBlank()) {
            return new PayHeroOrderInitiateResponse(
                    order.getId(), order.getPayheroReference(), "PENDING",
                    "Payment is already awaiting confirmation");
        }

        paymentProvider.validateConfiguration();
        PaymentInitiationResult result = paymentProvider.initiate(
                order.getTotal(), phone, "ORDER-" + order.getId());
        if (!result.accepted()) {
            throw new PaymentProviderException(
                    result.message() == null || result.message().isBlank()
                            ? "Payment provider rejected the request"
                            : result.message());
        }
        if (result.providerReference() == null || result.providerReference().isBlank()) {
            throw new PaymentProviderException("Payment provider did not return a transaction reference");
        }

        order.setPayheroReference(result.providerReference());
        orderRepository.save(order);
        return new PayHeroOrderInitiateResponse(
                order.getId(), result.providerReference(), "PENDING",
                result.message() == null ? "STK push accepted" : result.message());
    }

    public void handleCallback(PayHeroCallbackPayload callback) {
        String orderId = callback.externalReference().substring("ORDER-".length());
        Order order = orderRepository.findByIdWithDetailsForUpdate(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.CANCELLED) {
            return;
        }
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new ConflictException("Order is not awaiting payment");
        }
        if (order.getTotal() != callback.amount()) {
            throw new ConflictException("Callback amount does not match the order");
        }

        String providerReference = callback.providerReference() != null
                ? callback.providerReference()
                : callback.reference();
        if (providerReference != null) {
            order.setPayheroReference(providerReference);
        }

        if (callback.status().equalsIgnoreCase("SUCCESS")) {
            order.setStatus(OrderStatus.PAID);
            order.setPaidAt(callback.paidAt() != null ? callback.paidAt() : Instant.now());
            order.addTimelineEntry(OrderStatus.PAID, "Payment confirmed");
            notificationService.emit(
                    order.getAgent().getId(),
                    NotificationKind.ORDER,
                    "New paid order received",
                    order.getItems().size() + " item(s) · KES " + order.getTotal(),
                    "/agent/orders/" + order.getId());
        } else if (callback.status().equalsIgnoreCase("FAILED")) {
            order.setStatus(OrderStatus.CANCELLED);
            order.addTimelineEntry(OrderStatus.CANCELLED, "Payment failed");
            notificationService.emit(
                    order.getStudent().getId(),
                    NotificationKind.ORDER,
                    "Payment failed",
                    "Your marketplace payment was not completed. You can place the order again.",
                    "/student/orders/" + order.getId());
        }
        orderRepository.save(order);
    }

}
