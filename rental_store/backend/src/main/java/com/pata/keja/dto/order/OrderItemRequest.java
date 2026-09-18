package com.pata.keja.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(
        @NotBlank String kind, // "PRODUCT" or "PACK"
        @NotBlank String refId,
        @NotNull @Min(1) Integer quantity) {
}
