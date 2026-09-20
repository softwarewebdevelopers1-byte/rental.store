package com.pata.keja.dto.account;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record AccountUpdateRequest(
        @Email @Size(max = 180) String email,
        @Size(max = 512) String avatarUrl,
        String currentPassword,
        @Size(min = 8, max = 72) String newPassword) {
}
