package com.pata.keja.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pata.keja.dto.payment.PaymentCreateRequest;
import com.pata.keja.dto.payment.PaymentReminderRequest;
import com.pata.keja.dto.payment.PaymentResponse;
import com.pata.keja.dto.payment.LandlordPaymentStatsResponse;
import com.pata.keja.dto.payment.PaymentSummaryResponse;
import com.pata.keja.dto.payment.StudentPaymentSummaryResponse;
import com.pata.keja.enums.PaymentMethod;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.PaymentMapper;
import com.pata.keja.models.Payment;
import com.pata.keja.models.Student;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.PaymentRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.service.NotificationService;
import com.pata.keja.service.PaymentService;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final StudentRepository studentRepo;
    private final HostelRepository hostelRepo;
    private final RoomRepository roomRepo;
    private final PaymentMapper paymentMapper;
    private final NotificationService notificationService; // your next slice

    public PaymentServiceImpl(PaymentRepository paymentRepo,
            StudentRepository studentRepo,
            HostelRepository hostelRepo,
            RoomRepository roomRepo,
            PaymentMapper paymentMapper,
            NotificationService notificationService) {
        this.paymentRepo = paymentRepo;
        this.studentRepo = studentRepo;
        this.hostelRepo = hostelRepo;
        this.roomRepo = roomRepo;
        this.paymentMapper = paymentMapper;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentPaymentSummaryResponse summaryForStudent(String studentId) {
        Student student = studentRepo.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        long currentRent = student.getRoom() != null
                ? student.getRoom().getPrice()
                : 0L;

        List<Payment> history = paymentRepo.findAllByStudentWithAssociations(studentId);

        return paymentMapper.toStudentSummary(currentRent, history);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentSummaryResponse> listForStudent(String studentId, Pageable pageable) {
        return paymentRepo.findAllByStudentId(studentId, pageable).map(paymentMapper::toSummary);
    }

    @Override
    public PaymentResponse recordPayment(String studentId, PaymentCreateRequest req) {
        Student student = studentRepo.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (student.getHostel() == null) {
            throw new ConflictException("Student is not in a hostel");
        }

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setHostel(student.getHostel());
        payment.setRoom(student.getRoom());
        payment.setAmount(req.amount());
        payment.setDueDate(req.dueDate());
        payment.setStatus(PaymentStatus.PAID); // mock: recording a payment marks it paid
        payment.setPaidAt(Instant.now());
        payment.setMethod(req.method());
        payment.setReference(req.reference());
        payment.setNotes(req.notes());

        paymentRepo.save(payment);
        return paymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponse markPaid(String paymentId,
            PaymentMethodInput method,
            String reference) {
        Payment payment = paymentRepo.findByIdWithAssociations(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        if (method != null && method.method() != null) {
            payment.setMethod(PaymentMethod.valueOf(method.method()));
        }
        payment.setReference(reference);
        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentSummaryResponse> listForHostel(String hostelId,
            PaymentStatusFilter filter,
            Pageable pageable) {
        if (filter == null || filter == PaymentStatusFilter.ALL) {
            return paymentRepo.findAllByHostelId(hostelId, pageable)
                    .map(paymentMapper::toSummary);
        }
        PaymentStatus status = switch (filter) {
            case PAID -> PaymentStatus.PAID;
            case PENDING -> PaymentStatus.PENDING;
            case OVERDUE -> PaymentStatus.OVERDUE;
            case ALL -> null;
        };
        return paymentRepo.findAllByHostelIdAndStatus(hostelId, status, pageable)
                .map(paymentMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordPaymentStatsResponse statsForHostel(String hostelId) {
        long paid = paymentRepo.countByHostelIdAndStatus(hostelId, PaymentStatus.PAID);
        long pending = paymentRepo.countByHostelIdAndStatus(hostelId, PaymentStatus.PENDING);
        long overdue = paymentRepo.countByHostelIdAndStatus(hostelId, PaymentStatus.OVERDUE);
        long collected = paymentRepo.sumByHostelAndStatus(hostelId, PaymentStatus.PAID);
        long outstanding = paymentRepo.sumByHostelAndStatus(hostelId, PaymentStatus.PENDING)
                + paymentRepo.sumByHostelAndStatus(hostelId, PaymentStatus.OVERDUE);
        return new LandlordPaymentStatsResponse(paid, pending, overdue, collected, outstanding);
    }

    @Override
    public void sendReminders(String landlordId, PaymentCreateRequest req) {
        // Validate that the landlord owns all the students' hostels…
        // Then emit notifications (next slice) — for now, just log.
    }

    @Override
    public void sendReminders(String landlordId, PaymentReminderRequest req) {
        // Validate that the landlord owns all the students' hostels…
        // Then emit notifications (next slice) — for now, just log.
        req.studentIds().forEach(id -> {
            // notificationService.notify(id, NotificationKind.PAYMENT_DUE, ...);
        });
    }
}
