package com.pata.keja.controller;

import java.util.List;

import com.pata.keja.dto.notification.NotificationResponse;
import com.pata.keja.dto.notification.NotificationSummaryResponse;
import com.pata.keja.dto.notification.UnreadNotificationCountResponse;
import com.pata.keja.security.AppUserPrincipal;
import com.pata.keja.service.NotificationService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Notification center and topbar alerts — the frontend notification bell and inbox. */
@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public Page<NotificationResponse> list(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return notificationService.listForUser(principal.id(), pageable);
    }

    @GetMapping("/latest")
    public List<NotificationSummaryResponse> latest(@AuthenticationPrincipal AppUserPrincipal principal) {
        return notificationService.latestForUser(principal.id());
    }

    @GetMapping("/unread-count")
    public UnreadNotificationCountResponse unreadCount(@AuthenticationPrincipal AppUserPrincipal principal) {
        return new UnreadNotificationCountResponse(notificationService.unreadCount(principal.id()));
    }

    @PostMapping("/{id}/read")
    public NotificationResponse markRead(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return notificationService.markRead(id, principal.id());
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal AppUserPrincipal principal) {
        notificationService.markAllRead(principal.id());
        return ResponseEntity.noContent().build();
    }
}
