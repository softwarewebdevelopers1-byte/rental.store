package com.pata.keja.enums;

public enum VerificationStatus {
    /** Landlord has not requested verification yet. */
    NOT_REQUESTED,
    /** Landlord requested verification; awaiting admin decision. */
    PENDING,
    /** Admin approved — verified badge is shown. */
    APPROVED,
    /** Admin rejected — landlord may request again. */
    REJECTED
}
