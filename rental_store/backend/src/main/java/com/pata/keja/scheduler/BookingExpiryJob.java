package com.pata.keja.scheduler;

import com.pata.keja.enums.BookingRequestStatus;
import com.pata.keja.enums.NotificationKind;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.models.BookingRequest;
import com.pata.keja.models.Room;
import com.pata.keja.repository.BookingRequestRepository;
import com.pata.keja.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class BookingExpiryJob {

    private final BookingRequestRepository bookingRequestRepository;
    private final NotificationService notificationService;

    public BookingExpiryJob(BookingRequestRepository bookingRequestRepository,
            NotificationService notificationService) {
        this.bookingRequestRepository = bookingRequestRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireOverdueBookings() {
        List<BookingRequest> expired = bookingRequestRepository.findExpiredCandidates(Instant.now());
        for (BookingRequest booking : expired) {
            booking.setStatus(BookingRequestStatus.EXPIRED);
            booking.setDecidedAt(Instant.now());
            Room room = booking.getRoom();
            if (room != null && room.getStatus() == RoomStatus.HELD) {
                room.setStatus(RoomStatus.VACANT);
            }
            notificationService.emit(
                    booking.getStudent().getId(),
                    NotificationKind.BOOKING,
                    "Your booking request expired",
                    "Room " + room.getNumber() + " at " + booking.getHostel().getName() + " was not decided in time.",
                    "/student/dashboard");
        }
    }
}
