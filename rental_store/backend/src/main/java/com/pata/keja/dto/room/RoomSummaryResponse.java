package com.pata.keja.dto.room;

import com.pata.keja.enums.RoomStatus;
import com.pata.keja.enums.BillingPeriod;

public record RoomSummaryResponse(
        String id,
        String hostelId,
        String number,
        long price,
        BillingPeriod billingPeriod,
        RoomStatus status,
        String tenantId,
        String tenantName) {
}
