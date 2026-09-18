package com.pata.keja.dto.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeHostelRequest(

        @NotBlank @Size(max = 32) String newHostelCode) {
}
