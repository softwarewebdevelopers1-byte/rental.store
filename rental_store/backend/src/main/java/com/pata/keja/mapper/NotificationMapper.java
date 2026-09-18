package com.pata.keja.mapper;

import com.pata.keja.dto.notification.NotificationResponse;
import com.pata.keja.dto.notification.NotificationSummaryResponse;
import com.pata.keja.models.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getKind(),
                n.getTitle(),
                n.getBody(),
                n.getLink(),
                n.isRead(),
                n.getReadAt(),
                n.getCreatedAt());
    }

    public NotificationSummaryResponse toSummary(Notification n) {
        return new NotificationSummaryResponse(
                n.getId(),
                n.getKind(),
                n.getTitle(),
                n.getBody(),
                n.isRead(),
                n.getCreatedAt());
    }
}
