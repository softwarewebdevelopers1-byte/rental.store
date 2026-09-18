package com.pata.keja.dto.order;

import com.pata.keja.enums.OrderStatus;

import java.time.Instant;
import java.util.List;

public record OrderSummaryResponse(
        String id,
        OrderStatus status,
        long total,
        int itemCount,
        List<String> itemNames,
        String studentId,
        String studentName,
        String agentId,
        String agentName,
        Instant createdAt,
        Instant updatedAt) {
}
