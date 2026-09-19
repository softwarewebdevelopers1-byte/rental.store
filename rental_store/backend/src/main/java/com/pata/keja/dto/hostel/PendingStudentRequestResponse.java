package com.pata.keja.dto.hostel;

import java.time.Instant;

public record PendingStudentRequestResponse(
        String studentId,
        String studentName,
        String studentEmail,
        String requestedHostelId,
        String requestedHostelName,
        Instant requestedAt) {
}
