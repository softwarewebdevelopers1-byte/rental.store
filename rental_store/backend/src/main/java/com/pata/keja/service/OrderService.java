package com.pata.keja.service;

import com.pata.keja.enums.OrderStatus;
import com.pata.keja.dto.order.CreateOrderRequest;
import com.pata.keja.dto.order.OrderResponse;
import com.pata.keja.dto.order.OrderStatusUpdateRequest;
import com.pata.keja.dto.order.OrderSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderResponse create(String studentId, CreateOrderRequest req);

    Page<OrderSummaryResponse> listForStudent(String studentId, Pageable pageable);

    Page<OrderSummaryResponse> listForAgent(String agentId, OrderStatus filter, Pageable pageable);

    Page<OrderSummaryResponse> listAll(Pageable pageable);

    OrderResponse getById(String orderId, String viewerId);

    OrderResponse updateStatus(String orderId, String requesterId, OrderStatusUpdateRequest req);

    OrderResponse confirmReceived(String orderId, String studentId);
}
