package com.pata.keja.dto.marketplace;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PackCreateRequest(

        @NotBlank @Size(max = 160) String name,
        @Size(max = 2000) String description,
        @NotNull @Min(1) Long price,
        @Size(max = 512) String imageUrl,
        @NotEmpty List<PackItemRequest> items) {
}
