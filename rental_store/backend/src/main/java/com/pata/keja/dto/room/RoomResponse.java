package com.pata.keja.dto.room;

import java.time.Instant;

import com.pata.keja.enums.RoomStatus;

public record RoomResponse(
        String id,

        String hostelId,
        String hostelName,
        String hostelLocation,

        String number,
        long price,
        RoomStatus status,

        String tenantId,
        String tenantName,
        String tenantEmail,

        Instant createdAt,
        Instant updatedAt) {
}
