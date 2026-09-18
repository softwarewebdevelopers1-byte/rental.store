package com.pata.keja.dto.room;

import com.pata.keja.enums.RoomStatus;

public record RoomSummaryResponse(
        String id,
        String hostelId,
        String number,
        long price,
        RoomStatus status,
        String tenantId,
        String tenantName) {
}
