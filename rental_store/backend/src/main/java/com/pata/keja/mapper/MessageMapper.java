package com.pata.keja.mapper;

import com.pata.keja.dto.messaging.MessageResponse;
import com.pata.keja.models.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public MessageResponse toResponse(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getConversation().getId(),
                m.getSender().getId(),
                m.getSender().getName(),
                m.getSender().getRole().name(),
                m.getBody(),
                List.copyOf(m.getAttachments()),
                m.getCreatedAt());
    }

    // Import java.util.List at the top; kept inline for brevity here.
    private static final class List {
        static <T> java.util.List<T> copyOf(java.util.Collection<T> c) {
            return java.util.List.copyOf(c);
        }
    }
}
