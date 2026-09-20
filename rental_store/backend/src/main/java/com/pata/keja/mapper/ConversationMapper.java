package com.pata.keja.mapper;

import com.pata.keja.dto.messaging.ConversationResponse;
import com.pata.keja.dto.messaging.ConversationSummaryResponse;
import com.pata.keja.dto.messaging.MessageResponse;
import com.pata.keja.models.Conversation;
import com.pata.keja.models.ConversationParticipant;
import com.pata.keja.models.Message;
import com.pata.keja.models.User;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Component
public class ConversationMapper {

    private final MessageMapper messageMapper;

    public ConversationMapper(MessageMapper messageMapper) {
        this.messageMapper = messageMapper;
    }

    /**
     * Summary row for the conversation list. `viewerId` is the current user;
     * unread count and "other party" are computed relative to them.
     * `allMessages` must be the full message list for this conversation
     * (sorted or unsorted — mapper sorts internally).
     */
    public ConversationSummaryResponse toSummary(
            Conversation c,
            List<Message> allMessages,
            String viewerId) {

        List<Message> sorted = allMessages.stream()
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .toList();

        Message last = sorted.isEmpty() ? null : sorted.get(sorted.size() - 1);

        Instant viewerLastRead = c.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(viewerId))
                .map(ConversationParticipant::getLastReadAt)
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .orElse(null);

        int unread = (int) sorted.stream()
                .filter(m -> !m.getSender().getId().equals(viewerId))
                .filter(m -> viewerLastRead == null || m.getCreatedAt().isAfter(viewerLastRead))
                .count();

        ConversationParticipant other = c.getParticipants().stream()
                .filter(p -> !p.getUser().getId().equals(viewerId))
                .findFirst()
                .orElse(null);

        User otherUser = other != null ? other.getUser() : null;

        String preview = last == null
                ? ""
                : truncate(last.getBody(), 80);

        return new ConversationSummaryResponse(
                c.getId(),
                c.getSubject(),
                c.getTitle(),
                c.getLastMessageAt(),
                unread,
                preview,
                otherUser != null ? otherUser.getName() : "You",
                otherUser != null ? otherUser.getId() : viewerId,
                otherUser != null ? otherUser.getRole().name() : null);
    }

    /**
     * Full conversation detail with participants and messages.
     */
    public ConversationResponse toResponse(Conversation c, List<Message> messages) {
        List<MessageResponse> messageDtos = messages.stream()
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .map(messageMapper::toResponse)
                .toList();

        List<ConversationResponse.ParticipantSummary> participants = c.getParticipants().stream()
                .map(p -> new ConversationResponse.ParticipantSummary(
                        p.getUser().getId(),
                        p.getUser().getName(),
                        p.getUser().getRole().name(),
                        p.getLastReadAt()))
                .toList();

        return new ConversationResponse(
                c.getId(),
                c.getSubject(),
                c.getTitle(),
                c.getLastMessageAt(),
                c.getCreatedAt(),
                c.getUpdatedAt(),
                participants,
                messageDtos);
    }

    private static String truncate(String s, int max) {
        if (s == null)
            return "";
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }
}
