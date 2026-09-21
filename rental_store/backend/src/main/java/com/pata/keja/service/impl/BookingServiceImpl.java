package com.pata.keja.service.impl;

import com.pata.keja.dto.booking.BookingResponse;
import com.pata.keja.dto.booking.CreateBookingRequest;
import com.pata.keja.dto.booking.RejectBookingRequest;
import com.pata.keja.enums.*;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.models.*;
import com.pata.keja.repository.*;
import com.pata.keja.security.CurrentUserProvider;
import com.pata.keja.service.BookingService;
import com.pata.keja.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRequestRepository bookingRequestRepository;
    private final RoomRepository roomRepository;
    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;
    private final LandlordRepository landlordRepository;
    private final CaretakerRepository caretakerRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Value("${app.booking.hold-days:3}")
    private int holdDays;

    public BookingServiceImpl(BookingRequestRepository bookingRequestRepository,
            RoomRepository roomRepository,
            StudentRepository studentRepository,
            HostelRepository hostelRepository,
            LandlordRepository landlordRepository,
            CaretakerRepository caretakerRepository,
            PaymentRepository paymentRepository,
            NotificationService notificationService) {
        this.bookingRequestRepository = bookingRequestRepository;
        this.roomRepository = roomRepository;
        this.studentRepository = studentRepository;
        this.hostelRepository = hostelRepository;
        this.landlordRepository = landlordRepository;
        this.caretakerRepository = caretakerRepository;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
    }

    @Override
    public BookingResponse create(CreateBookingRequest request) {
        Student student = requireStudent(CurrentUserProvider.requireUserId());
        if (bookingRequestRepository.existsByStudentIdAndStatusIn(
                student.getId(), List.of(BookingRequestStatus.PENDING, BookingRequestStatus.APPROVED))) {
            throw new ConflictException("You already have a pending booking request. Cancel it before making a new one.");
        }

        Room room = roomRepository.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new NotFoundException("Room not found"));
        if (room.getHostel() == null) {
            throw new ConflictException("This room is no longer available.");
        }
        if (room.getStatus() != RoomStatus.VACANT) {
            throw new ConflictException("This room is no longer available.");
        }
        if (bookingRequestRepository.findActiveForRoom(room.getId()).isPresent()) {
            throw new ConflictException("Another student has just requested this room.");
        }

        BookingRequest booking = new BookingRequest();
        booking.setStudent(student);
        booking.setHostel(room.getHostel());
        booking.setRoom(room);
        booking.setInitiation(request.initiation());
        booking.setMoveInDate(request.moveInDate());
        booking.setMessage(request.message());
        booking.setStatus(BookingRequestStatus.PENDING);
        booking.setExpiresAt(Instant.now().plus(Duration.ofDays(holdDays)));

        if (request.initiation() == BookingInitiation.PAY_NOW) {
            Payment payment = new Payment();
            payment.setStudent(student);
            payment.setHostel(room.getHostel());
            payment.setRoom(room);
            payment.setAmount(room.getPrice());
            payment.setDueDate(request.moveInDate());
            payment.setStatus(PaymentStatus.PAID);
            payment.setMethod(PaymentMethod.MPESA);
            payment.setPaidAt(Instant.now());
            payment.setRecordedBy(student);
            payment.setReference(request.paymentReference());
            payment.setNotes("First month's rent for booking request pending approval");
            paymentRepository.save(payment);
            booking.setPayment(payment);
        }

        room.setStatus(RoomStatus.HELD);
        BookingRequest saved = bookingRequestRepository.save(booking);
        if (saved.getPayment() != null) {
            saved.getPayment().setNotes("First month's rent for booking request " + saved.getId());
            paymentRepository.save(saved.getPayment());
        }
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> listMyBookings() {
        return bookingRequestRepository.findAllByStudent(CurrentUserProvider.requireUserId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BookingResponse cancel(String bookingId) {
        String currentUserId = CurrentUserProvider.requireUserId();
        BookingRequest booking = bookingRequestRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking request not found"));
        if (!booking.getStudent().getId().equals(currentUserId)) {
            throw new ConflictException("You do not own this booking request.");
        }
        if (booking.getStatus() != BookingRequestStatus.PENDING) {
            throw new ConflictException("Approved bookings cannot be cancelled here. Contact your landlord.");
        }
        booking.setStatus(BookingRequestStatus.CANCELLED);
        Room room = booking.getRoom();
        if (room.getStatus() == RoomStatus.HELD) {
            room.setStatus(RoomStatus.VACANT);
        }
        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> listForCurrentLandlord(BookingRequestStatus status, Pageable pageable) {
        String landlordId = CurrentUserProvider.requireUserId();
        Landlord landlord = landlordRepository.findByIdWithHostels(landlordId)
                .orElseThrow(() -> new NotFoundException("Landlord not found"));
        List<String> hostelIds = landlord.getHostels().stream().map(Hostel::getId).toList();
        if (hostelIds.isEmpty()) {
            return org.springframework.data.domain.Page.empty(pageable);
        }
        return bookingRequestRepository.searchForHostels(hostelIds, status, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> listForCurrentCaretaker(BookingRequestStatus status, Pageable pageable) {
        String caretakerId = CurrentUserProvider.requireUserId();
        Caretaker caretaker = caretakerRepository.findByIdWithHostels(caretakerId)
                .orElseThrow(() -> new NotFoundException("Caretaker not found"));
        List<String> hostelIds = caretaker.getAssignedHostels().stream().map(Hostel::getId).toList();
        if (hostelIds.isEmpty()) {
            return org.springframework.data.domain.Page.empty(pageable);
        }
        return bookingRequestRepository.searchForHostels(hostelIds, status, pageable)
                .map(this::toResponse);
    }

    @Override
    public BookingResponse approve(String bookingId) {
        String landlordId = CurrentUserProvider.requireUserId();
        BookingRequest booking = bookingRequestRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking request not found"));
        if (!booking.getHostel().getLandlord().getId().equals(landlordId)) {
            throw new ConflictException("You do not own this hostel.");
        }
        if (booking.getStatus() != BookingRequestStatus.PENDING) {
            throw new ConflictException("This request has already been decided.");
        }

        Room room = roomRepository.findByIdForUpdate(booking.getRoom().getId())
                .orElseThrow(() -> new NotFoundException("Room not found"));
        if (room.getStatus() != RoomStatus.HELD) {
            throw new ConflictException("The room is no longer available.");
        }
        if (bookingRequestRepository.findActiveForRoom(room.getId())
                .filter(b -> !b.getId().equals(booking.getId())).isPresent()) {
            throw new ConflictException("The room is no longer available.");
        }

        Student student = booking.getStudent();
        Hostel hostel = booking.getHostel();
        room.setStatus(RoomStatus.BOOKED);
        room.setTenant(student);
        booking.setStatus(BookingRequestStatus.APPROVED);
        booking.setDecidedAt(Instant.now());
        booking.setDecidedBy(landlordRepository.getReferenceById(landlordId));

        student.setMembershipStatus(MembershipStatus.ACTIVE);
        student.setHostel(hostel);
        student.setRoom(room);
        student.setRequestedHostel(null);
        student.setActivatedAt(Instant.now());

        notificationService.emit(
                student.getId(),
                NotificationKind.BOOKING,
                "Your booking was approved",
                "You're now a tenant at " + hostel.getName() + ", Room " + room.getNumber() + ".",
                "/student/dashboard");

        return toResponse(booking);
    }

    @Override
    public BookingResponse reject(String bookingId, RejectBookingRequest request) {
        String landlordId = CurrentUserProvider.requireUserId();
        BookingRequest booking = bookingRequestRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking request not found"));
        if (!booking.getHostel().getLandlord().getId().equals(landlordId)) {
            throw new ConflictException("You do not own this hostel.");
        }
        if (booking.getStatus() != BookingRequestStatus.PENDING) {
            throw new ConflictException("This request has already been decided.");
        }

        Room room = roomRepository.findByIdForUpdate(booking.getRoom().getId())
                .orElseThrow(() -> new NotFoundException("Room not found"));
        if (room.getStatus() != RoomStatus.HELD) {
            throw new ConflictException("The room is no longer available.");
        }

        booking.setStatus(BookingRequestStatus.REJECTED);
        booking.setDecidedAt(Instant.now());
        booking.setDecidedBy(landlordRepository.getReferenceById(landlordId));
        booking.setRejectionReason(request.reason());
        room.setStatus(RoomStatus.VACANT);
        room.setTenant(null);

        if (booking.getPayment() != null) {
            booking.getPayment().setNotes(
                    "Refund required — booking rejected by landlord. Reason: " + request.reason());
            paymentRepository.save(booking.getPayment());
        }

        notificationService.emit(
                booking.getStudent().getId(),
                NotificationKind.BOOKING,
                "Your booking was declined",
                "Room " + room.getNumber() + " at " + booking.getHostel().getName() + ": " + request.reason(),
                "/student/dashboard");

        return toResponse(booking);
    }

    private Student requireStudent(String studentId) {
        return studentRepository.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
    }

    private BookingResponse toResponse(BookingRequest booking) {
        Payment payment = booking.getPayment();
        return new BookingResponse(
                booking.getId(),
                booking.getStudent() != null ? booking.getStudent().getId() : null,
                booking.getStudent() != null ? booking.getStudent().getName() : null,
                booking.getStudent() != null ? booking.getStudent().getEmail() : null,
                booking.getHostel() != null ? booking.getHostel().getId() : null,
                booking.getHostel() != null ? booking.getHostel().getName() : null,
                booking.getRoom() != null ? booking.getRoom().getId() : null,
                booking.getRoom() != null ? booking.getRoom().getNumber() : null,
                booking.getRoom() != null ? booking.getRoom().getPrice() : 0L,
                booking.getStatus(),
                booking.getInitiation(),
                booking.getMoveInDate(),
                booking.getMessage(),
                payment != null ? payment.getId() : null,
                payment != null ? payment.getStatus() : null,
                booking.getDecidedAt(),
                booking.getDecidedBy() != null ? booking.getDecidedBy().getName() : null,
                booking.getRejectionReason(),
                booking.getExpiresAt(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }
}
