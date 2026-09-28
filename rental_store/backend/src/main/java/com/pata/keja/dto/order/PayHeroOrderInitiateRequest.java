package com.pata.keja.dto.order;

import jakarta.validation.constraints.NotBlank;

public record PayHeroOrderInitiateRequest(
        @NotBlank String phone) {
}
