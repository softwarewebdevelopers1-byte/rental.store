package com.pata.keja.dto.payment;

import jakarta.validation.constraints.NotBlank;

public record PayHeroInitiateRequest(
        @NotBlank String bookingRequestId,
        @NotBlank String phone) {
}
