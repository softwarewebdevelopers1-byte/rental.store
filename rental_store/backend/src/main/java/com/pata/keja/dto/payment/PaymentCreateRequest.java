package com.pata.keja.dto.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

import com.pata.keja.enums.PaymentMethod;

public record PaymentCreateRequest(

        @NotNull @Min(1) Long amount,

        @NotNull LocalDate dueDate,

        PaymentMethod method,

        @Size(max = 64) String reference,

        @Size(max = 500) String notes) {
}
