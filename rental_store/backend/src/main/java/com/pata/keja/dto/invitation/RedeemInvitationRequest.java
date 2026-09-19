package com.pata.keja.dto.invitation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedeemInvitationRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(min = 8, max = 72) String password,
        @Size(max = 160) String businessName) {
}
