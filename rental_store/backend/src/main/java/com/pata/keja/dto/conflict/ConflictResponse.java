package com.pata.keja.dto.conflict;

import com.pata.keja.enums.ConflictIssue;
import com.pata.keja.enums.ConflictStatus;

import java.time.Instant;
import java.util.List;

public record ConflictResponse(
        String id,
        String orderId,
        long orderTotal,
        ConflictIssue issue,
        String description,
        ConflictStatus status,

        String studentId,
        String studentName,
        String studentEmail,

        String agentId,
        String agentName,
        String agentEmail,

        String resolvedById,
        String resolvedByName,
        String resolution,
        Instant resolvedAt,

        List<String> attachments,

        Instant createdAt,
        Instant updatedAt) {
}
