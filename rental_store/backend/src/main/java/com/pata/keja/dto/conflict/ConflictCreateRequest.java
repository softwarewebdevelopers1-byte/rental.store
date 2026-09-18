package com.pata.keja.dto.conflict;

import com.pata.keja.enums.ConflictIssue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ConflictCreateRequest(

        @NotNull ConflictIssue issue,
        @NotBlank @Size(max = 4000) String description,
        List<@Size(max = 512) String> attachments) {
}
