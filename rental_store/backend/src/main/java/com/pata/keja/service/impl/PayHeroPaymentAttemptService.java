package com.pata.keja.service.impl;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pata.keja.dto.payment.PayHeroInitiateRequest;
import com.pata.keja.dto.payment.PayHeroInitiateResponse;
import com.pata.keja.enums.BookingInitiation;
import com.pata.keja.enums.BookingRequestStatus;
import com.pata.keja.enums.NotificationKind;
import com.pata.keja.enums.PaymentMethod;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.models.BookingRequest;
import com.pata.keja.models.Payment;
import com.pata.keja.models.Room;
import com.pata.keja.models.Student;
import com.pata.keja.payment.PaymentStatusResult;
import com.pata.keja.payment.payhero.PayHeroCallbackPayload;
import com.pata.keja.payment.payhero.PayHeroPhoneNumber;
import com.pata.keja.repository.BookingRequestRepository;
import com.pata.keja.repository.PaymentRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.service.NotificationService;

@Service
public class PayHeroPaymentAttemptService {

    private final BookingRequestRepository bookingRequestRepository;
    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;

    public PayHeroPaymentAttemptService(
            BookingRequestRepository bookingRequestRepository,
            PaymentRepository paymentRepository,
            RoomRepository roomRepository,
            StudentRepository studentRepository,
            NotificationService notificationService) {
        this.bookingRequestRepository = bookingRequestRepository;
        this.paymentRepository = paymentRepository;
        this.roomRepository = roomRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Attempt prepare(String studentId, PayHeroInitiateRequest request) {
        BookingRequest booking = bookingRequestRepository.findByIdWithDetailsForUpdate(request.bookingRequestId())
                .orElseThrow(() -> new NotFoundException("Booking request not found"));
        if (!booking.getStudent().getId().equals(studentId)) {
            throw new ConflictException("You do not own this booking request.");
        }
        if (booking.getStatus() != BookingRequestStatus.PENDING) {
            throw new ConflictException("This booking request is no longer pending.");
        }
        if (booking.getInitiation() != BookingInitiation.PAY_NOW) {
            throw new ConflictException("This booking request is not awaiting online payment.");
        }

        Room room = roomRepository.findByIdForUpdate(booking.getRoom().getId())
                .orElseThrow(() -> new NotFoundException("Room not found"));
        if (room.getStatus() != RoomStatus.HELD) {
            throw new ConflictException("The room is no longer held for this booking request.");
        }

        Student student = studentRepository.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        String phone = PayHeroPhoneNumber.normalize(request.phone());

        Payment existing = booking.getPayment();
        if (existing != null) {
            if (existing.getStatus() == PaymentStatus.PAID) {
                return new Attempt(booking.getId(), existing.getId(), existing.getAmount(), phone,
                        null, false, "PAID", "Payment has already been received");
            }
            if (existing.getStatus() == PaymentStatus.PENDING) {
                return new Attempt(booking.getId(), existing.getId(), existing.getAmount(), phone,
                        null, false, "PENDING", "Payment is already being processed");
            }
            if (existing.getStatus() == PaymentStatus.FAILED) {
                throw new ConflictException("This payment has failed. Create a new booking request to try again.");
            }
        }

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setHostel(booking.getHostel());
        payment.setRoom(room);
        payment.setAmount(room.getPrice());
        payment.setDueDate(booking.getMoveInDate());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setMethod(PaymentMethod.MPESA);
        payment.setRecordedBy(student);
        payment.setNotes("PayHero STK Push — booking request " + booking.getId());

        String externalReference = "BK-" + booking.getId();
        paymentRepository.saveAndFlush(payment);
        booking.setPayment(payment);
        bookingRequestRepository.saveAndFlush(booking);

        return new Attempt(
                booking.getId(),
                payment.getId(),
                payment.getAmount(),
                phone,
                externalReference,
                true,
                "PENDING",
                "STK request is being sent");
    }

    @Transactional
    public PayHeroInitiateResponse accepted(Attempt attempt, String providerReference, String message) {
        BookingRequest booking = findBookingForUpdate(attempt.bookingId());
        Payment payment = requirePayment(booking);
        if (payment.getStatus() == PaymentStatus.PENDING) {
            payment.setPayheroReference(providerReference);
        }
        return response(booking, payment, message);
    }

    @Transactional
    public PayHeroInitiateResponse rejected(Attempt attempt, String message) {
        BookingRequest booking = findBookingForUpdate(attempt.bookingId());
        Payment payment = requirePayment(booking);
        if (payment.getStatus() == PaymentStatus.PENDING
                && booking.getStatus() == BookingRequestStatus.PENDING) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setNotes("PayHero rejected the STK request");
            booking.setStatus(BookingRequestStatus.CANCELLED);
            booking.setDecidedAt(Instant.now());

            Room room = roomRepository.findByIdForUpdate(booking.getRoom().getId())
                    .orElseThrow(() -> new NotFoundException("Room not found"));
            if (room.getStatus() == RoomStatus.HELD) {
                room.setStatus(RoomStatus.VACANT);
                room.setTenant(null);
            }
            notificationService.emit(
                    booking.getStudent().getId(),
                    NotificationKind.BOOKING,
                    "Payment failed",
                    "PayHero could not start your payment. The room is no longer held. You can try again.",
                    "/student/dashboard");
        }
        return response(booking, payment, message);
    }

    @Transactional(readOnly = true)
    public StatusCheck pendingStatusCheck(String bookingId, String studentId) {
        BookingRequest booking = bookingRequestRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking request not found"));
        if (!booking.getStudent().getId().equals(studentId)) {
            throw new ConflictException("You do not own this booking request.");
        }
        Payment payment = booking.getPayment();
        if (booking.getStatus() != BookingRequestStatus.PENDING
                || payment == null
                || payment.getStatus() != PaymentStatus.PENDING
                || payment.getPayheroReference() == null
                || payment.getPayheroReference().isBlank()) {
            return null;
        }
        return new StatusCheck(
                booking.getId(),
                "BK-" + booking.getId(),
                payment.getAmount(),
                payment.getPayheroReference());
    }

    @Transactional
    public void processCallback(PayHeroCallbackPayload callback) {
        String bookingId = callback.externalReference().substring("BK-".length());
        BookingRequest booking = findBookingForUpdate(bookingId);
        Payment payment = requirePayment(booking);
        if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.FAILED) {
            return;
        }
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ConflictException("Payment is not pending");
        }
        if (booking.getStatus() != BookingRequestStatus.PENDING) {
            throw new ConflictException("Booking request is no longer pending");
        }
        if (payment.getAmount() != callback.amount()) {
            throw new ConflictException("Callback amount does not match the payment");
        }

        if (callback.providerReference() != null
                && (payment.getPayheroReference() == null || payment.getPayheroReference().isBlank())) {
            payment.setPayheroReference(callback.providerReference());
        }
        if (callback.reference() != null) {
            payment.setReference(callback.reference());
        }

        if (callback.status().equalsIgnoreCase("SUCCESS")) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(callback.paidAt() != null ? callback.paidAt() : Instant.now());
            notificationService.emit(
                    booking.getStudent().getId(),
                    NotificationKind.BOOKING,
                    "Payment received",
                    "Your payment of KES " + callback.amount() + " for Room "
                            + booking.getRoom().getNumber() + " at " + booking.getHostel().getName()
                            + " was received. Awaiting landlord approval.",
                    "/student/dashboard");
            if (booking.getHostel().getLandlord() != null) {
                notificationService.emit(
                        booking.getHostel().getLandlord().getId(),
                        NotificationKind.BOOKING,
                        "New paid booking request",
                        booking.getStudent().getName() + " has paid for Room "
                                + booking.getRoom().getNumber() + " at " + booking.getHostel().getName()
                                + ". Review the request.",
                        "/landlord/bookings");
            }
        } else if (callback.status().equalsIgnoreCase("FAILED")) {
            payment.setStatus(PaymentStatus.FAILED);
            booking.setStatus(BookingRequestStatus.CANCELLED);
            Room room = roomRepository.findByIdForUpdate(booking.getRoom().getId())
                    .orElseThrow(() -> new NotFoundException("Room not found"));
            if (room.getStatus() == RoomStatus.HELD) {
                room.setStatus(RoomStatus.VACANT);
                room.setTenant(null);
            }
            notificationService.emit(
                    booking.getStudent().getId(),
                    NotificationKind.BOOKING,
                    "Payment failed",
                    "Your payment was not completed. The room is no longer held. You can try again.",
                    "/student/dashboard");
        }
        paymentRepository.save(payment);
        bookingRequestRepository.save(booking);
    }

    private BookingRequest findBookingForUpdate(String bookingId) {
        return bookingRequestRepository.findByIdWithDetailsForUpdate(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking request not found"));
    }

    private static Payment requirePayment(BookingRequest booking) {
        Payment payment = booking.getPayment();
        if (payment == null) {
            throw new ConflictException("Booking request has no payment");
        }
        return payment;
    }

    private static PayHeroInitiateResponse response(BookingRequest booking, Payment payment, String message) {
        return new PayHeroInitiateResponse(
                booking.getId(),
                payment.getId(),
                payment.getPayheroReference(),
                payment.getStatus().name(),
                message);
    }

    public record Attempt(
            String bookingId,
            String paymentId,
            long amount,
            String phone,
            String externalReference,
            boolean shouldInitiate,
            String status,
            String message) {

        public PayHeroInitiateResponse response() {
            return new PayHeroInitiateResponse(
                    bookingId, paymentId, null, status, message);
        }
    }

    public record StatusCheck(
            String bookingId,
            String externalReference,
            long amount,
            String payheroReference) {
    }
}
