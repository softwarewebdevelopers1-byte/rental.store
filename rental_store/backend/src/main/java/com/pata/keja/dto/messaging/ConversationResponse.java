package com.pata.keja.dto.messaging;

import com.pata.keja.enums.ConversationSubject;

import java.time.Instant;
import java.util.List;

public record ConversationResponse(
        String id,
        ConversationSubject subject,
        String title,
        Instant lastMessageAt,
        Instant createdAt,
        Instant updatedAt,
        List<ParticipantSummary> participants,
        List<MessageResponse> messages) {
    public record ParticipantSummary(
            String userId,
            String name,
            String role,
            Instant lastReadAt) {
    }
}
