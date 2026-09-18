package com.pata.keja.dto.rating;

import java.util.Map;

public record HostelRatingStatsResponse(
        String hostelId,
        double averageRating,
        int totalReviews,
        /** Bucket "1".."5" -> count. */
        Map<Integer, Long> distribution) {
}
