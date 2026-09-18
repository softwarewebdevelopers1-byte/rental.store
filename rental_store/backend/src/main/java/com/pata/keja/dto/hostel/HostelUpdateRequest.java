package com.pata.keja.dto.hostel;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record HostelUpdateRequest(

        @Size(max = 160) String name,

        @Pattern(regexp = "^[A-Z0-9\\-]+$", message = "Hostel code must contain only uppercase letters, digits, and hyphens") @Size(max = 32) String code,

        @Size(max = 200) String location,
        @Size(max = 2000) String description,
        List<@Size(max = 512) String> images,
        Boolean active) {
}
