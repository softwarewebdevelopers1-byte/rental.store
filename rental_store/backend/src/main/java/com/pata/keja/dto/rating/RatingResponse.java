package com.pata.keja.dto.rating;

import java.time.Instant;

public record RatingResponse(
        String id,
        String hostelId,
        String hostelName,
        String studentId,
        String studentName,
        String studentEmail,
        int stars,
        String comment,
        Instant createdAt,
        Instant updatedAt) {
}
