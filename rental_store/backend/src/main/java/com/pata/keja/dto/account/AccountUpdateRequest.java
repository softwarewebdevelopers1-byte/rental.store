package com.pata.keja.dto.account;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record AccountUpdateRequest(
        @Email @Size(max = 180) String email,
        @jakarta.validation.constraints.Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone must be in international E.164 format, e.g. +254712345678")
        String phone,
        @Size(max = 512) String avatarUrl,
        String currentPassword,
        @Size(min = 8, max = 72) String newPassword) {
}
