package com.pata.keja.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.pata.keja.enums.BookingRequestStatus;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.models.BookingRequest;
import com.pata.keja.models.Payment;
import com.pata.keja.models.Room;
import com.pata.keja.models.Student;
import com.pata.keja.repository.BookingRequestRepository;
import com.pata.keja.repository.PaymentRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.service.NotificationService;

class PayHeroPaymentAttemptServiceTest {

    @Test
    void rejectedStkRequestFailsPaymentAndReleasesHeldRoom() {
        BookingRequestRepository bookings = mock(BookingRequestRepository.class);
        PaymentRepository payments = mock(PaymentRepository.class);
        RoomRepository rooms = mock(RoomRepository.class);
        StudentRepository students = mock(StudentRepository.class);
        NotificationService notifications = mock(NotificationService.class);

        Student student = new Student();
        student.setId("student-1");
        BookingRequest booking = new BookingRequest();
        booking.setId("booking-1");
        booking.setStudent(student);
        booking.setStatus(BookingRequestStatus.PENDING);
        Payment payment = new Payment();
        payment.setId("payment-1");
        payment.setStatus(PaymentStatus.PENDING);
        booking.setPayment(payment);
        Room room = new Room();
        room.setId("room-1");
        room.setStatus(RoomStatus.HELD);
        booking.setRoom(room);

        when(bookings.findByIdWithDetailsForUpdate("booking-1")).thenReturn(Optional.of(booking));
        when(rooms.findByIdForUpdate("room-1")).thenReturn(Optional.of(room));

        PayHeroPaymentAttemptService service = new PayHeroPaymentAttemptService(
                bookings, payments, rooms, students, notifications);
        PayHeroPaymentAttemptService.Attempt attempt = new PayHeroPaymentAttemptService.Attempt(
                "booking-1", "payment-1", 12500, "+254712345678",
                "BK-booking-1", true, "PENDING", "STK request is being sent");

        service.rejected(attempt, "PayHero rejected the STK request");

        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        assertEquals(BookingRequestStatus.CANCELLED, booking.getStatus());
        assertEquals(RoomStatus.VACANT, room.getStatus());
        assertEquals("FAILED", service.rejected(attempt, "duplicate callback").status());
    }
}
