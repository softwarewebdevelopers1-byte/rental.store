package com.pata.keja.dto.landlord;

public record LandlordStatsResponse(
        int totalHostels,
        int totalRooms,
        int vacantRooms,
        int bookedRooms,
        int activeTenants,
        int pendingRequests,
        int outstandingPayments,
        int unreadMessages) {
}
