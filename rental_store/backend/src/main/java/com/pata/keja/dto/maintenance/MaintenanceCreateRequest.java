package com.pata.keja.dto.maintenance;

import com.pata.keja.enums.MaintenanceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record MaintenanceCreateRequest(

        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 4000) String description,
        @NotNull MaintenanceCategory category,
        List<@Size(max = 512) String> attachments) {
}
