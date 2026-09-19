package com.pata.keja.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record AdminUserUpdateRequest(
        @Size(max = 120) String name,
        @Email @Size(max = 180) String email,
        Boolean active) {
}
