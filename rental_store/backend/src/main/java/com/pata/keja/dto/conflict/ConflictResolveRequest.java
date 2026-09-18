package com.pata.keja.dto.conflict;

import com.pata.keja.enums.ConflictStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ConflictResolveRequest(

        @NotNull ConflictStatus decision, // RESOLVED or REJECTED
        @NotBlank @Size(max = 2000) String resolution) {
}
