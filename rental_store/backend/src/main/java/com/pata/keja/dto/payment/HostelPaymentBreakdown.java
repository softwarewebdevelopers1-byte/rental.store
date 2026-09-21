package com.pata.keja.dto.payment;

public record HostelPaymentBreakdown(
        String hostelId,
        String hostelName,
        long paidCount,
        long pendingCount,
        long overdueCount,
        long collectedThisMonth) {
}
