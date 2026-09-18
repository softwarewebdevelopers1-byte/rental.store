package com.pata.keja.dto.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record StudentUpdateRequest(

        @Size(max = 120) String name,
        @Email @Size(max = 180) String email,
        @Size(max = 32) String phone,
        @Size(max = 512) String avatarUrl,
        Boolean active) {
}
