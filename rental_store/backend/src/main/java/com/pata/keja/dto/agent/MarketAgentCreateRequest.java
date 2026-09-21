package com.pata.keja.dto.agent;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MarketAgentCreateRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @jakarta.validation.constraints.Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone must be in international E.164 format, e.g. +254712345678")
        @Size(max = 32) String phone,
        @Size(max = 160) String businessName) {
}
