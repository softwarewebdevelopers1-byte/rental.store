package com.pata.keja.dto.booking;

import jakarta.validation.constraints.Size;

public record RejectBookingRequest(@Size(max = 500) String reason) {
}
