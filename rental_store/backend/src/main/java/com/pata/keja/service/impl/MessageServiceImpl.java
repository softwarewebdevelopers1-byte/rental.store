package com.pata.keja.service.impl;

import com.pata.keja.enums.ConversationSubject;
import com.pata.keja.dto.messaging.*;
import com.pata.keja.models.Conversation;
import com.pata.keja.models.ConversationParticipant;
import com.pata.keja.models.Message;
import com.pata.keja.models.User;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.ConversationMapper;
import com.pata.keja.mapper.MessageMapper;
import com.pata.keja.messaging.MessageEventBus;
import com.pata.keja.repository.ConversationParticipantRepository;
import com.pata.keja.repository.ConversationRepository;
import com.pata.keja.repository.MessageRepository;
import com.pata.keja.repository.UserRepository;
import com.pata.keja.service.MessageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    private final ConversationRepository conversationRepo;
    private final ConversationParticipantRepository participantRepo;
    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final ConversationMapper conversationMapper;
    private final MessageMapper messageMapper;
    private final MessageEventBus messageEventBus;

    public MessageServiceImpl(ConversationRepository conversationRepo,
            ConversationParticipantRepository participantRepo,
            MessageRepository messageRepo,
            UserRepository userRepo,
            ConversationMapper conversationMapper,
            MessageMapper messageMapper,
            MessageEventBus messageEventBus) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.conversationMapper = conversationMapper;
        this.messageMapper = messageMapper;
        this.messageEventBus = messageEventBus;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> listConversationsForUser(String userId) {
        return conversationRepo.findAllForUser(userId).stream()
                .map(c -> conversationMapper.toSummary(
                        c,
                        messageRepo.findAllByConversation(c.getId()),
                        userId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationResponse getConversation(String conversationId, String viewerId) {
        Conversation c = conversationRepo.findByIdWithParticipants(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversation not found"));

        requireParticipant(c, viewerId);
        List<Message> messages = messageRepo.findAllByConversation(conversationId);
        return conversationMapper.toResponse(c, messages);
    }

    @Override
    public ConversationResponse startConversation(String creatorId, StartConversationRequest req) {
        User creator = userRepo.findById(creatorId)
                .orElseThrow(() -> new NotFoundException("Creator not found"));

        List<User> users = new ArrayList<>();
        users.add(creator);
        for (String id : req.participantUserIds()) {
            if (id.equals(creatorId))
                continue;
            users.add(userRepo.findById(id)
                    .orElseThrow(() -> new NotFoundException("User not found: " + id)));
        }
        if (users.size() < 2) {
            throw new ConflictException("Conversation needs at least 2 participants");
        }

        Conversation c = new Conversation();
        c.setSubject(req.subject() != null ? req.subject() : ConversationSubject.GENERAL);
        c.setTitle(req.title());
        c.setLastMessageAt(Instant.now());
        for (User u : users) {
            ConversationParticipant p = new ConversationParticipant();
            p.setUser(u);
            c.addParticipant(p);
        }
        conversationRepo.save(c);
        return conversationMapper.toResponse(c, List.of());
    }

    @Override
    public MessageResponse sendMessage(String conversationId, String senderId, SendMessageRequest req) {
        Conversation c = conversationRepo.findByIdWithParticipants(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversation not found"));

        ConversationParticipant senderParticipant = requireParticipant(c, senderId);

        Message m = new Message();
        m.setConversation(c);
        m.setSender(senderParticipant.getUser());
        m.setBody(req.body());
        if (req.attachments() != null) {
            m.setAttachments(new ArrayList<>(req.attachments()));
        }
        messageRepo.save(m);

        c.setLastMessageAt(Instant.now());
        // Author has read their own message
        senderParticipant.setLastReadAt(m.getCreatedAt());

        MessageResponse response = messageMapper.toResponse(m);
        c.getParticipants().stream()
                .filter(participant -> !participant.getUser().getId().equals(senderId))
                .forEach(participant -> messageEventBus.publish(participant.getUser().getId(), response));
        return response;
    }

    @Override
    public MessageResponse editMessage(String messageId, String userId, EditMessageRequest req) {
        Message message = messageRepo.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        if (!message.getSender().getId().equals(userId)) {
            throw new ConflictException("You can only edit your own messages");
        }
        message.setBody(req.body());
        return messageMapper.toResponse(message);
    }

    @Override
    public void deleteMessage(String messageId, String userId) {
        Message message = messageRepo.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        if (!message.getSender().getId().equals(userId)) {
            throw new ConflictException("You can only delete your own messages");
        }
        messageRepo.delete(message);
    }

    @Override
    public MessageResponse forwardMessage(String messageId, String userId, ForwardMessageRequest req) {
        Message source = messageRepo.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        Conversation sourceConversation = conversationRepo.findByIdWithParticipants(
                source.getConversation().getId()).orElseThrow(() -> new NotFoundException("Conversation not found"));
        requireParticipant(sourceConversation, userId);
        ConversationResponse target = getOrCreateDirect(userId, req.targetUserId());
        Message forwarded = new Message();
        Conversation targetConversation = conversationRepo.findByIdWithParticipants(target.id())
                .orElseThrow(() -> new NotFoundException("Conversation not found"));
        ConversationParticipant sender = requireParticipant(targetConversation, userId);
        forwarded.setConversation(targetConversation);
        forwarded.setSender(sender.getUser());
        forwarded.setBody(source.getBody());
        messageRepo.save(forwarded);
        targetConversation.setLastMessageAt(Instant.now());
        sender.setLastReadAt(forwarded.getCreatedAt());
        return messageMapper.toResponse(forwarded);
    }

    @Override
    public void markRead(String conversationId, String userId) {
        ConversationParticipant p = participantRepo
                .findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new NotFoundException("Not a participant"));
        p.setLastReadAt(Instant.now());
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadCountForUser(String userId) {
        List<Conversation> conversations = conversationRepo.findAllForUser(userId);
        long total = 0;
        for (Conversation c : conversations) {
            Instant lastRead = c.getParticipants().stream()
                    .filter(p -> p.getUser().getId().equals(userId))
                    .map(ConversationParticipant::getLastReadAt)
                    .filter(java.util.Objects::nonNull)
                    .findFirst()
                    .orElse(null);
            if (lastRead == null) {
                total += messageRepo.findAllByConversation(c.getId()).size();
            } else {
                total += messageRepo.countByConversationIdAndCreatedAtAfter(c.getId(), lastRead);
            }
        }
        return total;
    }

    @Override
    public ConversationResponse getOrCreateDirect(String userAId, String userBId) {
        if (userAId.equals(userBId)) {
            throw new ConflictException("Cannot start a conversation with yourself");
        }
        userRepo.findById(userBId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userBId));

        List<Conversation> existing = conversationRepo.findByParticipants(
                List.of(userAId, userBId), 2);
        if (!existing.isEmpty()) {
            Conversation c = existing.get(0);
            return conversationMapper.toResponse(c, messageRepo.findAllByConversation(c.getId()));
        }
        return startConversation(userAId,
                new StartConversationRequest(List.of(userBId), ConversationSubject.GENERAL, null));
    }

    // Helper
    private ConversationParticipant requireParticipant(Conversation c, String userId) {
        return c.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new ConflictException("Not a participant in this conversation"));
    }
}
