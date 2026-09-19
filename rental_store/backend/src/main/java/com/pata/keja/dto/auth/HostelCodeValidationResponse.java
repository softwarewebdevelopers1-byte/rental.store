package com.pata.keja.dto.auth;

public record HostelCodeValidationResponse(boolean valid, String hostelId, String hostelName) {
}
