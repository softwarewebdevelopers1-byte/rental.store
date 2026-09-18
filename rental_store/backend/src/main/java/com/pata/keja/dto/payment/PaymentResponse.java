package com.pata.keja.dto.payment;

import java.time.Instant;
import java.time.LocalDate;

import com.pata.keja.enums.PaymentMethod;
import com.pata.keja.enums.PaymentStatus;

public record PaymentResponse(
        String id,

        String studentId,
        String studentName,
        String studentEmail,

        String hostelId,
        String hostelName,

        String roomId,
        String roomNumber,

        long amount,
        PaymentStatus status,
        LocalDate dueDate,
        Instant paidAt,
        PaymentMethod method,
        String reference,
        String notes,

        Instant createdAt,
        Instant updatedAt) {
}
