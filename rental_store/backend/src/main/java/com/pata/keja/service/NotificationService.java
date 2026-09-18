package com.pata.keja.service;

import com.pata.keja.enums.NotificationKind;
import com.pata.keja.dto.notification.NotificationResponse;
import com.pata.keja.dto.notification.NotificationSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    Page<NotificationResponse> listForUser(String userId, Pageable pageable);

    List<NotificationSummaryResponse> latestForUser(String userId);

    long unreadCount(String userId);

    NotificationResponse markRead(String notificationId, String userId);

    void markAllRead(String userId);

    /**
     * The single entry point used by every other service to emit a notification.
     */
    NotificationResponse emit(String userId,
            NotificationKind kind,
            String title,
            String body,
            String link);
}
