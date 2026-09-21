package com.pata.keja.dto.booking;

import com.pata.keja.enums.BookingInitiation;
import com.pata.keja.enums.BookingRequestStatus;
import com.pata.keja.enums.PaymentStatus;

import java.time.Instant;
import java.time.LocalDate;

public record BookingResponse(
        String id,
        String studentId,
        String studentName,
        String studentEmail,
        String hostelId,
        String hostelName,
        String roomId,
        String roomNumber,
        long roomPrice,
        BookingRequestStatus status,
        BookingInitiation initiation,
        LocalDate moveInDate,
        String message,
        String paymentId,
        PaymentStatus paymentStatus,
        Instant decidedAt,
        String decidedByName,
        String rejectionReason,
        Instant expiresAt,
        Instant createdAt,
        Instant updatedAt) {
}
