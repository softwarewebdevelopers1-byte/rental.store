package com.pata.keja.dto.payment;

import java.time.LocalDate;
import java.util.List;

import com.pata.keja.enums.PaymentStatus;

public record StudentPaymentSummaryResponse(
        long currentRent,
        PaymentStatus currentStatus,
        LocalDate nextDueDate,
        Long nextAmount,
        List<PaymentSummaryResponse> history) {
}
