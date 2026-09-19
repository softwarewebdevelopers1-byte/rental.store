package com.pata.keja.dto.messaging;

import jakarta.validation.constraints.NotBlank;

public record ForwardMessageRequest(
        @NotBlank String targetUserId) {
}
