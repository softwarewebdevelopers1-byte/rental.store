package com.pata.keja.mapper;

import org.springframework.stereotype.Component;

import com.pata.keja.dto.payment.PaymentResponse;
import com.pata.keja.dto.payment.PaymentSummaryResponse;
import com.pata.keja.dto.payment.StudentPaymentSummaryResponse;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.models.Payment;
import com.pata.keja.models.Room;
import com.pata.keja.models.Student;

import java.util.List;

@Component
public class PaymentMapper {

    public PaymentSummaryResponse toSummary(Payment p) {
        Student s = p.getStudent();
        Room r = p.getRoom();
        return new PaymentSummaryResponse(
                p.getId(),
                s != null ? s.getId() : null,
                s != null ? s.getName() : null,
                p.getHostel().getId(),
                p.getHostel().getName(),
                r != null ? r.getId() : null,
                r != null ? r.getNumber() : null,
                p.getAmount(),
                p.getStatus(),
                p.getDueDate(),
                p.getPaidAt(),
                p.getMethod());
    }

    public PaymentResponse toResponse(Payment p) {
        Student s = p.getStudent();
        Room r = p.getRoom();
        return new PaymentResponse(
                p.getId(),

                s != null ? s.getId() : null,
                s != null ? s.getName() : null,
                s != null ? s.getEmail() : null,

                p.getHostel().getId(),
                p.getHostel().getName(),

                r != null ? r.getId() : null,
                r != null ? r.getNumber() : null,

                p.getAmount(),
                p.getStatus(),
                p.getDueDate(),
                p.getPaidAt(),
                p.getMethod(),
                p.getReference(),
                p.getNotes(),

                p.getCreatedAt(),
                p.getUpdatedAt());
    }

    /**
     * Builds the student dashboard payment card from a full history list.
     * The caller is responsible for filtering and sorting the list.
     * `currentRent` comes from the student's room, not from payment records.
     */
    public StudentPaymentSummaryResponse toStudentSummary(long currentRent, List<Payment> history) {
        Payment nextUnpaid = history.stream()
                .filter(p -> p.getStatus() != PaymentStatus.PAID)
                .min((a, b) -> a.getDueDate().compareTo(b.getDueDate()))
                .orElse(null);

        List<PaymentSummaryResponse> historyDtos = history.stream()
                .map(this::toSummary)
                .toList();

        return new StudentPaymentSummaryResponse(
                currentRent,
                nextUnpaid != null ? nextUnpaid.getStatus() : PaymentStatus.PAID,
                nextUnpaid != null ? nextUnpaid.getDueDate() : null,
                nextUnpaid != null ? nextUnpaid.getAmount() : null,
                historyDtos);
    }
}
