package com.pata.keja.dto.order;

import com.pata.keja.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderStatusUpdateRequest(
        @NotNull OrderStatus status,
        @Size(max = 500) String note) {
}
