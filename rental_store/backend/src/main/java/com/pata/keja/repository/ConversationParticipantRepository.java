package com.pata.keja.repository;

import com.pata.keja.models.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversationParticipantRepository
        extends JpaRepository<ConversationParticipant, String> {

    Optional<ConversationParticipant> findByConversationIdAndUserId(
            String conversationId, String userId);
}
