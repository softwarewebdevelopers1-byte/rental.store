package com.pata.keja.dto.hostel;

import java.time.Instant;

public record HostelSummaryResponse(
        String id,
        String name,
        String code,
        String location,
        String mainImage,
        double rating,
        int reviewCount,
        int vacantRooms,
        int totalRooms,
        Long minPrice,
        Long maxPrice,
        boolean landlordVerified,
        String landlordId,
        String landlordName,
        Instant createdAt) {
}
