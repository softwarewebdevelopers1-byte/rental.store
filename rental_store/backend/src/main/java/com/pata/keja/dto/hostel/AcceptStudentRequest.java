package com.pata.keja.dto.hostel;

import jakarta.validation.constraints.NotBlank;

/** The room the landlord is assigning while accepting a hostel request. */
public record AcceptStudentRequest(@NotBlank String roomId) {
}
