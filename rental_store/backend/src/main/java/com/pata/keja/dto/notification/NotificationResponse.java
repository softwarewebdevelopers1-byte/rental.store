package com.pata.keja.dto.notification;

import com.pata.keja.enums.NotificationKind;

import java.time.Instant;

public record NotificationResponse(
        String id,
        NotificationKind kind,
        String title,
        String body,
        String link,
        boolean read,
        Instant readAt,
        Instant createdAt) {
}
