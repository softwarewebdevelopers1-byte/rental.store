package com.pata.keja.dto.maintenance;

import com.pata.keja.enums.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;

public record MaintenanceStatusUpdateRequest(@NotNull MaintenanceStatus status) {
}
