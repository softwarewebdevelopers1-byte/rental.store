package com.pata.keja.enums;

public enum MembershipStatus {
    /** Student has registered but their hostel request has not been decided. */
    PENDING,
    /** Landlord accepted; student is an active tenant. */
    ACTIVE,
    /** Landlord rejected the request, or student was removed. */
    REJECTED,
    /** Student left the hostel or the account is disabled. */
    INACTIVE
}
