package com.pata.keja.dto.room;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import com.pata.keja.enums.BillingPeriod;

public record RoomUpdateRequest(

        @Size(max = 16) String number,

        @Min(0) Long price,

        BillingPeriod billingPeriod) {
}
