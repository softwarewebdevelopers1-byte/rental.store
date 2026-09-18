package com.pata.keja.service;

import com.pata.keja.dto.messaging.*;

import java.util.List;

public interface MessageService {

    List<ConversationSummaryResponse> listConversationsForUser(String userId);

    ConversationResponse getConversation(String conversationId, String viewerId);

    ConversationResponse startConversation(String creatorId, StartConversationRequest req);

    MessageResponse sendMessage(String conversationId, String senderId, SendMessageRequest req);

    void markRead(String conversationId, String userId);

    long unreadCountForUser(String userId);

    /**
     * Finds an existing 2-participant conversation or creates one.
     * Used by "Message landlord" / "Message caretaker" buttons.
     */
    ConversationResponse getOrCreateDirect(String userAId, String userBId);
}
