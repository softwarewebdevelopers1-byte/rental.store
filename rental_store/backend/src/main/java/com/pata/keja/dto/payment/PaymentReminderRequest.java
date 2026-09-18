package com.pata.keja.dto.payment;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PaymentReminderRequest(

        @NotEmpty @Size(max = 200) List<String> studentIds,

        @Size(max = 500) String message) {
}
