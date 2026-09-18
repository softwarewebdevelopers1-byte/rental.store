package com.pata.keja.dto.conflict;

import com.pata.keja.enums.ConflictIssue;
import com.pata.keja.enums.ConflictStatus;

import java.time.Instant;

public record ConflictSummaryResponse(
        String id,
        String orderId,
        ConflictIssue issue,
        ConflictStatus status,
        String studentId,
        String studentName,
        String agentId,
        String agentName,
        Instant createdAt,
        Instant resolvedAt) {
}
