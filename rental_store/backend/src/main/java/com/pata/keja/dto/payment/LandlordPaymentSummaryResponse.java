package com.pata.keja.dto.payment;

import java.util.List;

public record LandlordPaymentSummaryResponse(
        long totalPaidCount,
        long totalPendingCount,
        long totalOverdueCount,
        long totalFailedCount,
        long totalCollectedThisMonth,
        long totalOutstanding,
        List<HostelPaymentBreakdown> byHostel) {
}
