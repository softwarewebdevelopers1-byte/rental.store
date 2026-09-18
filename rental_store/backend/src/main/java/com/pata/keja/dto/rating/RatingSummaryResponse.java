package com.pata.keja.dto.rating;

import java.time.Instant;

public record RatingSummaryResponse(
        String id,
        String hostelId,
        String studentId,
        String studentName,
        int stars,
        String comment,
        Instant createdAt) {
}
