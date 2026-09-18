package com.pata.keja.dto.messaging;

import com.pata.keja.enums.ConversationSubject;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record StartConversationRequest(

        @NotEmpty @Size(max = 20) List<String> participantUserIds,

        ConversationSubject subject,

        @Size(max = 160) String title) {
}
