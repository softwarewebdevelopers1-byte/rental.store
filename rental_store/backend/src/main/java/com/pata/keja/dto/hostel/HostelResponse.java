package com.pata.keja.dto.hostel;

import java.time.Instant;
import java.util.List;

public record HostelResponse(
        String id,
        String name,
        String code,
        String location,
        String description,
        List<String> images,
        double rating,
        int reviewCount,
        boolean active,

        String landlordId,
        String landlordName,
        boolean landlordVerified,

        int totalRooms,
        int vacantRooms,
        int bookedRooms,
        Long minPrice,
        Long maxPrice,

        List<RoomSummary> rooms,

        List<CaretakerSummary> caretakers,

        Instant createdAt,
        Instant updatedAt) {
    /** Nested DTOs so the Hostel response is self-contained. */
    public record RoomSummary(
            String id,
            String number,
            long price,
            String status,
            String tenantId,
            String tenantName) {
    }

    public record CaretakerSummary(
            String id,
            String name,
            String email) {
    }
}
