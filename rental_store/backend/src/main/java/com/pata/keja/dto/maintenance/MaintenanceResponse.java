package com.pata.keja.dto.maintenance;

import com.pata.keja.enums.MaintenanceCategory;
import com.pata.keja.enums.MaintenanceStatus;

import java.time.Instant;
import java.util.List;

public record MaintenanceResponse(
        String id,
        String title,
        String description,
        MaintenanceCategory category,
        MaintenanceStatus status,

        String studentId,
        String studentName,
        String studentEmail,

        String hostelId,
        String hostelName,
        String roomId,
        String roomNumber,

        String conversationId,

        List<String> attachments,

        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt) {
}
