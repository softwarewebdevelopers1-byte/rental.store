package com.pata.keja.dto.messaging;

import java.time.Instant;
import java.util.List;

public record MessageResponse(
        String id,
        String conversationId,
        String senderId,
        String senderName,
        String senderRole,
        String body,
        List<String> attachments,
        Instant createdAt) {
}
