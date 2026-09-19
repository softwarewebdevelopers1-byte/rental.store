package com.pata.keja.dto.caretaker;

public record CaretakerStatsResponse(
        int assignedHostels,
        int totalTenants,
        int openRequests,
        int inProgressRequests,
        int resolvedRequests) {
}
