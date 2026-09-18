package com.pata.keja.dto.order;

import com.pata.keja.enums.OrderStatus;

import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String id,
        OrderStatus status,
        long total,

        String studentId,
        String studentName,
        String studentEmail,

        String agentId,
        String agentName,

        List<OrderItemResponse> items,
        List<OrderTimelineEntryResponse> timeline,

        Instant createdAt,
        Instant updatedAt) {
}
