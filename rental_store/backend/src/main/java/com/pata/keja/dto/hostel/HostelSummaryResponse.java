package com.pata.keja.dto.hostel;

import java.time.Instant;
import com.pata.keja.enums.BillingPeriod;

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
        BillingPeriod billingPeriod,
        boolean landlordVerified,
        String landlordId,
        String landlordName,
        boolean active,
        Instant createdAt) {
}
