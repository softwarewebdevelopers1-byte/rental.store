package com.pata.keja.dto.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudentRegistrationRequest(

        @NotBlank @Size(max = 120) String name,

        @NotBlank @Email @Size(max = 180) String email,

        @NotBlank @Size(min = 8, max = 72) String password,

        @NotBlank @jakarta.validation.constraints.Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone must be in international E.164 format, e.g. +254712345678")
        @Size(max = 32) String phone,

        @Size(max = 32) String hostelCode) {
}
