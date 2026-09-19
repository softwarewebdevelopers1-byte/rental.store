package com.pata.keja.mapper;

import com.pata.keja.dto.messaging.MessageResponse;
import com.pata.keja.models.Message;
import org.springframework.stereotype.Component;

import java.util.List;

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
                m.getAttachments() == null ? List.of() : List.copyOf(m.getAttachments()),
                m.getCreatedAt());
    }
}
