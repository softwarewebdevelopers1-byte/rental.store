package com.pata.keja.dto.messaging;

import com.pata.keja.enums.ConversationSubject;

import com.pata.keja.enums.ConversationSubject;

import java.time.Instant;

public record ConversationSummaryResponse(
        String id,
        ConversationSubject subject,
        String title,
        Instant lastMessageAt,
        int unreadCount,
        String lastMessagePreview,
        String otherPartyName,
        String otherPartyId,
        String otherPartyRole) {
}
