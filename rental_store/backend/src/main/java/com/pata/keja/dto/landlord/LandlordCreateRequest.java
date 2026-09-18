package com.pata.keja.dto.landlord;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LandlordCreateRequest(

        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @Size(max = 32) String phone,
        @Size(max = 512) String avatarUrl) {
}
