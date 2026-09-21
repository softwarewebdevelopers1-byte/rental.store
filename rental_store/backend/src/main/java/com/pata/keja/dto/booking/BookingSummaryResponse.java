package com.pata.keja.dto.booking;

import com.pata.keja.enums.BookingInitiation;
import com.pata.keja.enums.BookingRequestStatus;

import java.time.Instant;
import java.time.LocalDate;

public record BookingSummaryResponse(
        String id,
        String hostelId,
        String hostelName,
        String roomId,
        String roomNumber,
        long roomPrice,
        BookingRequestStatus status,
        BookingInitiation initiation,
        LocalDate moveInDate,
        Instant expiresAt,
        Instant createdAt) {
}
