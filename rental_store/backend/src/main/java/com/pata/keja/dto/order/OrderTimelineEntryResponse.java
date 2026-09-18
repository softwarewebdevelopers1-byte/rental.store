package com.pata.keja.dto.order;

import com.pata.keja.enums.OrderStatus;

import java.time.Instant;

public record OrderTimelineEntryResponse(
        OrderStatus status,
        Instant at,
        String note) {
}
