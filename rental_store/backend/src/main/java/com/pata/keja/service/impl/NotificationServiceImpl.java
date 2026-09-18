package com.pata.keja.service.impl;

import com.pata.keja.enums.NotificationKind;
import com.pata.keja.dto.notification.NotificationResponse;
import com.pata.keja.dto.notification.NotificationSummaryResponse;
import com.pata.keja.models.Notification;
import com.pata.keja.models.User;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.NotificationMapper;
import com.pata.keja.repository.NotificationRepository;
import com.pata.keja.repository.UserRepository;
import com.pata.keja.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepo,
            UserRepository userRepo,
            NotificationMapper notificationMapper) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
        this.notificationMapper = notificationMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> listForUser(String userId, Pageable pageable) {
        return notificationRepo
                .findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationSummaryResponse> latestForUser(String userId) {
        return notificationRepo.findTop10ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadCount(String userId) {
        return notificationRepo.countByUserIdAndReadFalse(userId);
    }

    @Override
    public NotificationResponse markRead(String notificationId, String userId) {
        Notification n = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));

        if (!n.getUser().getId().equals(userId)) {
            throw new ConflictException("You can only update your own notifications.");
        }
        n.markRead();
        return notificationMapper.toResponse(n);
    }

    @Override
    public void markAllRead(String userId) {
        notificationRepo.markAllRead(userId, Instant.now());
    }

    @Override
    public NotificationResponse emit(String userId,
            NotificationKind kind,
            String title,
            String body,
            String link) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Notification n = new Notification();
        n.setUser(user);
        n.setKind(kind);
        n.setTitle(title);
        n.setBody(body);
        n.setLink(link);
        notificationRepo.save(n);
        return notificationMapper.toResponse(n);
    }
}
