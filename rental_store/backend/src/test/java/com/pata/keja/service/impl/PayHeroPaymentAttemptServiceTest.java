package com.pata.keja.service.impl;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.pata.keja.enums.BookingRequestStatus;
import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.models.BookingRequest;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Payment;
import com.pata.keja.models.Room;
import com.pata.keja.models.Student;
import com.pata.keja.payment.payhero.PayHeroCallbackPayload;
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

    @Test
    void failedCallbackReleasesBookedRoomAndRemovesSameStudentsAssignment() {
        BookingRequestRepository bookings = mock(BookingRequestRepository.class);
        PaymentRepository payments = mock(PaymentRepository.class);
        RoomRepository rooms = mock(RoomRepository.class);
        StudentRepository students = mock(StudentRepository.class);
        NotificationService notifications = mock(NotificationService.class);

        Student student = new Student();
        student.setId("student-1");
        student.setMembershipStatus(MembershipStatus.ACTIVE);
        Hostel hostel = new Hostel();
        hostel.setId("hostel-1");
        Room room = new Room();
        room.setId("room-1");
        room.setStatus(RoomStatus.BOOKED);
        room.setTenant(student);
        student.setRoom(room);
        student.setHostel(hostel);

        BookingRequest booking = new BookingRequest();
        booking.setId("booking-1");
        booking.setStudent(student);
        booking.setHostel(hostel);
        booking.setRoom(room);
        booking.setStatus(BookingRequestStatus.PENDING);
        Payment payment = new Payment();
        payment.setId("payment-1");
        payment.setAmount(12500);
        payment.setStatus(PaymentStatus.PENDING);
        booking.setPayment(payment);

        when(bookings.findByIdWithDetailsForUpdate("booking-1")).thenReturn(Optional.of(booking));
        when(rooms.findByIdForUpdate("room-1")).thenReturn(Optional.of(room));

        PayHeroPaymentAttemptService service = new PayHeroPaymentAttemptService(
                bookings, payments, rooms, students, notifications);
        service.processCallback(new PayHeroCallbackPayload(
                "BK-booking-1", "FAILED", 12500, null, null, null));

        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        assertEquals(BookingRequestStatus.CANCELLED, booking.getStatus());
        assertEquals(RoomStatus.VACANT, room.getStatus());
        assertNull(room.getTenant());
        assertNull(student.getRoom());
        assertNull(student.getHostel());
        assertEquals(MembershipStatus.INACTIVE, student.getMembershipStatus());
    }

    @Test
    void failedPaymentDoesNotReleaseRoomAssignedToAnotherStudent() {
        BookingRequestRepository bookings = mock(BookingRequestRepository.class);
        PaymentRepository payments = mock(PaymentRepository.class);
        RoomRepository rooms = mock(RoomRepository.class);
        StudentRepository students = mock(StudentRepository.class);
        NotificationService notifications = mock(NotificationService.class);

        Student bookingStudent = new Student();
        bookingStudent.setId("booking-student");
        Student tenant = new Student();
        tenant.setId("current-tenant");
        Room room = new Room();
        room.setId("room-1");
        room.setStatus(RoomStatus.BOOKED);
        room.setTenant(tenant);
        BookingRequest booking = new BookingRequest();
        booking.setId("booking-1");
        booking.setStudent(bookingStudent);
        booking.setRoom(room);
        booking.setStatus(BookingRequestStatus.PENDING);
        Payment payment = new Payment();
        payment.setAmount(12500);
        payment.setStatus(PaymentStatus.PENDING);
        booking.setPayment(payment);

        when(bookings.findByIdWithDetailsForUpdate("booking-1")).thenReturn(Optional.of(booking));
        when(rooms.findByIdForUpdate("room-1")).thenReturn(Optional.of(room));

        PayHeroPaymentAttemptService service = new PayHeroPaymentAttemptService(
                bookings, payments, rooms, students, notifications);
        service.processCallback(new PayHeroCallbackPayload(
                "BK-booking-1", "FAILED", 12500, null, null, null));

        assertEquals(RoomStatus.BOOKED, room.getStatus());
        assertEquals(tenant, room.getTenant());
    }
}
