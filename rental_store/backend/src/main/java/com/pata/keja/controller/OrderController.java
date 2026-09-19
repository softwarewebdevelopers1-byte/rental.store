package com.pata.keja.controller;

import java.net.URI;

import jakarta.validation.Valid;

import com.pata.keja.dto.order.CreateOrderRequest;
import com.pata.keja.dto.order.OrderResponse;
import com.pata.keja.dto.order.OrderStatusUpdateRequest;
import com.pata.keja.dto.order.OrderSummaryResponse;
import com.pata.keja.enums.OrderStatus;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.OrderService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Marketplace orders — the student order flow and agent fulfillment dashboard. */
@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<OrderResponse> create(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.create(principal.id(), request);
        return ResponseEntity.created(URI.create("/api/orders/me/" + response.id())).body(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public Page<OrderSummaryResponse> listForCurrentStudent(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return orderService.listForStudent(principal.id(), pageable);
    }

    @GetMapping("/me/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public OrderResponse getStudentOrder(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return orderService.getById(id, principal.id());
    }

    @PostMapping("/me/{id}/receive")
    @PreAuthorize("hasRole('STUDENT')")
    public OrderResponse confirmReceived(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return orderService.confirmReceived(id, principal.id());
    }

    @GetMapping("/agent")
    @PreAuthorize("hasRole('MARKET_AGENT')")
    public Page<OrderSummaryResponse> listForCurrentAgent(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return orderService.listForAgent(principal.id(), status, pageable);
    }

    @GetMapping("/agent/{id}")
    @PreAuthorize("hasRole('MARKET_AGENT')")
    public OrderResponse getAgentOrder(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return orderService.getById(id, principal.id());
    }

    @PatchMapping("/agent/{id}/status")
    @PreAuthorize("hasRole('MARKET_AGENT')")
    public OrderResponse updateStatus(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateStatus(id, principal.id(), request);
    }
}
