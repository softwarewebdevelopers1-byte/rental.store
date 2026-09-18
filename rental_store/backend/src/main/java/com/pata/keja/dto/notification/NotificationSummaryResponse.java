package com.pata.keja.dto.notification;

import com.pata.keja.enums.NotificationKind;

import java.time.Instant;

public record NotificationSummaryResponse(
        String id,
        NotificationKind kind,
        String title,
        String body,
        boolean read,
        Instant createdAt) {
}
