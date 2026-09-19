package com.pata.keja.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import com.pata.keja.dto.messaging.ConversationResponse;
import com.pata.keja.dto.messaging.ConversationSummaryResponse;
import com.pata.keja.dto.messaging.MessageResponse;
import com.pata.keja.dto.messaging.SendMessageRequest;
import com.pata.keja.dto.messaging.StartConversationRequest;
import com.pata.keja.dto.messaging.UnreadCountResponse;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.MessageService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Messaging inbox and conversations — the frontend chat and message buttons. */
@RestController
@RequestMapping("/api/messages")
@PreAuthorize("isAuthenticated()")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversations")
    public List<ConversationSummaryResponse> listConversations(
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return messageService.listConversationsForUser(principal.id());
    }

    @GetMapping("/conversations/{id}")
    public ConversationResponse getConversation(
            @PathVariable("id") String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return messageService.getConversation(id, principal.id());
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> startConversation(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody StartConversationRequest request) {
        ConversationResponse response = messageService.startConversation(principal.id(), request);
        return ResponseEntity.created(URI.create("/api/messages/conversations/" + response.id())).body(response);
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable("id") String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendMessage(id, principal.id(), request);
        return ResponseEntity.created(URI.create("/api/messages/conversations/" + id + "/messages/" + response.id()))
                .body(response);
    }

    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable("id") String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        messageService.markRead(id, principal.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(@AuthenticationPrincipal AppUserPrincipal principal) {
        return new UnreadCountResponse(messageService.unreadCountForUser(principal.id()));
    }

    @PostMapping("/direct/{userId}")
    public ResponseEntity<ConversationResponse> getOrCreateDirect(
            @PathVariable String userId,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        ConversationResponse response = messageService.getOrCreateDirect(principal.id(), userId);
        return ResponseEntity.created(URI.create("/api/messages/conversations/" + response.id())).body(response);
    }
}
