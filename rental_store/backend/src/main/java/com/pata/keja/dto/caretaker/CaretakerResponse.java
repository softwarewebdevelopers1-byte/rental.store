package com.pata.keja.dto.caretaker;

import java.time.Instant;
import java.util.List;

import com.pata.keja.enums.UserRoles;

public record CaretakerResponse(
        String id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        UserRoles role,
        boolean active,
        List<String> assignedHostelIds,
        Instant createdAt,
        Instant updatedAt) {
}
