package com.pata.keja.repository;

import com.pata.keja.enums.NotificationKind;
import com.pata.keja.models.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    Page<Notification> findAllByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Notification> findTop10ByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndReadFalse(String userId);

    List<Notification> findAllByUserIdAndReadFalse(String userId);

    boolean existsByUserIdAndKindAndCreatedAtAfter(
            String userId, NotificationKind kind, Instant after);

    /**
     * Bulk "mark all read" for a user — one UPDATE instead of N.
     */
    @Modifying
    @Query("""
                update Notification n
                set n.read = true, n.readAt = :now
                where n.user.id = :userId and n.read = false
            """)
    int markAllRead(@Param("userId") String userId, @Param("now") Instant now);
}
