package com.pata.keja.dto.hostel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CaretakerPaymentPermissionRequest(
        @NotBlank String caretakerId,
        @NotNull Boolean allowed) {
}
