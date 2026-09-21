package com.pata.keja.dto.payment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PaymentBatchRecordRequest(
        @NotEmpty @Size(max = 500) List<@Valid PaymentRecordItem> payments,
        @Size(max = 64) String periodLabel) {
}
