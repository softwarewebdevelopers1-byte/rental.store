package com.pata.keja.dto.landlord;

import com.pata.keja.enums.VerificationStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VerificationDecisionRequest(

        @NotNull VerificationStatus decision, // only APPROVED or REJECTED are honored
        @Size(max = 500) String notes) {
}
