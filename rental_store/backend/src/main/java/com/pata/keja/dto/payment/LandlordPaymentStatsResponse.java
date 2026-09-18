package com.pata.keja.dto.payment;

public record LandlordPaymentStatsResponse(
        long paidCount,
        long pendingCount,
        long overdueCount,
        long totalCollected,
        long totalOutstanding) {
}
