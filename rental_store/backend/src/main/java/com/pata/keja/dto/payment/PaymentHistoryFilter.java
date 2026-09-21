package com.pata.keja.dto.payment;

import com.pata.keja.enums.PaymentMethod;
import com.pata.keja.enums.PaymentStatus;

import java.time.LocalDate;

public record PaymentHistoryFilter(
        String studentId,
        String studentQuery,
        String hostelId,
        String roomId,
        Long minAmount,
        Long maxAmount,
        PaymentStatus status,
        PaymentMethod method,
        LocalDate fromDate,
        LocalDate toDate,
        String periodLabel,
        String reference) {
}
