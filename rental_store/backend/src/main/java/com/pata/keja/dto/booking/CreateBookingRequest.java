package com.pata.keja.dto.booking;

import com.pata.keja.enums.BookingInitiation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateBookingRequest(
        @NotBlank String roomId,
        @NotNull LocalDate moveInDate,
        @NotNull BookingInitiation initiation,
        @Size(max = 1000) String message,
        @Size(max = 64) String paymentReference) {
}
