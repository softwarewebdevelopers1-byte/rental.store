package com.pata.keja.dto.maintenance;

import com.pata.keja.enums.MaintenanceCategory;
import com.pata.keja.enums.MaintenanceStatus;

import java.time.Instant;

public record MaintenanceSummaryResponse(
        String id,
        String title,
        MaintenanceCategory category,
        MaintenanceStatus status,
        String studentId,
        String studentName,
        String hostelId,
        String hostelName,
        String roomNumber,
        Instant createdAt,
        Instant updatedAt) {
}
