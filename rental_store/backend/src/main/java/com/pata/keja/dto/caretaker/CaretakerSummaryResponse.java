package com.pata.keja.dto.caretaker;

import java.time.Instant;
import java.util.List;

public record CaretakerSummaryResponse(
        String id,
        String name,
        String email,
        boolean active,
        List<String> assignedHostelIds,
        Instant createdAt) {
}
