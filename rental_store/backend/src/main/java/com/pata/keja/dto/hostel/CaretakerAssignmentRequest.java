package com.pata.keja.dto.hostel;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CaretakerAssignmentRequest(

        @NotBlank @Email String caretakerEmail) {
}
