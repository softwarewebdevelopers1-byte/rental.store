package com.pata.keja.dto.payment;

import com.pata.keja.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PaymentRecordItem(
        @NotBlank String studentId,
        @NotNull @Min(1) Long amount,
        @NotNull LocalDate dueDate,
        PaymentMethod method,
        @Size(max = 64) String reference) {
}
