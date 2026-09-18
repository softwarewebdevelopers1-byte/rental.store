package com.pata.keja.dto.marketplace;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PackUpdateRequest(

        @Size(max = 160) String name,
        @Size(max = 2000) String description,
        @Min(1) Long price,
        @Size(max = 512) String imageUrl,
        List<PackItemRequest> items,
        Boolean active) {
}
