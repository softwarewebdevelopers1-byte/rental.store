package com.pata.keja.dto.admin;

public record PlatformStatsResponse(
        long totalStudents,
        long totalLandlords,
        long totalCaretakers,
        long totalMarketAgents,
        long totalHostels,
        long totalRooms,
        long vacantRooms,
        long bookedRooms,
        long pendingVerifications,
        long pendingStudentRequests,
        long marketplaceOrders,
        long marketplaceConflicts) {
}
