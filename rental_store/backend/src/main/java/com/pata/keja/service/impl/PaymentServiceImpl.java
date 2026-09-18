package com.pata.keja.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pata.keja.dto.payment.PaymentCreateRequest;
import com.pata.keja.dto.payment.PaymentResponse;
import com.pata.keja.dto.payment.StudentPaymentSummaryResponse;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.mapper.PaymentMapper;
import com.pata.keja.models.Payment;
import com.pata.keja.models.Student;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.PaymentRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.StudentRepository;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final StudentRepository studentRepo;
    private final HostelRepository hostelRepo;
    private final RoomRepository roomRepo;
    private final PaymentMapper paymentMapper;
    private final notificationService notificationService; // your next slice

    // constructor injection …

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
    public void sendReminders(String landlordId, PaymentReminderRequest req) {
        // Validate that the landlord owns all the students' hostels…
        // Then emit notifications (next slice) — for now, just log.
        req.studentIds().forEach(id -> {
            // notificationService.notify(id, NotificationKind.PAYMENT_DUE, ...);
        });
    }
}
