package com.pata.keja.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.pata.keja.dto.payment.LandlordPaymentStatsResponse;
import com.pata.keja.dto.payment.PaymentCreateRequest;
import com.pata.keja.dto.payment.PaymentReminderRequest;
import com.pata.keja.dto.payment.PaymentResponse;
import com.pata.keja.dto.payment.PaymentSummaryResponse;
import com.pata.keja.dto.payment.StudentPaymentSummaryResponse;

public interface PaymentService {

    StudentPaymentSummaryResponse summaryForStudent(String studentId);

    Page<PaymentSummaryResponse> listForStudent(String studentId, Pageable pageable);

    Page<PaymentSummaryResponse> listForHostel(
            String hostelId,
            PaymentStatusFilter filter,
            Pageable pageable);

    PaymentResponse recordPayment(String studentId, PaymentCreateRequest req);

    PaymentResponse markPaid(String paymentId, PaymentMethodInput method, String reference);

    LandlordPaymentStatsResponse statsForHostel(String hostelId);

    void sendReminders(String landlordId, PaymentCreateRequest req);

    void sendReminders(String landlordId, PaymentReminderRequest req);

    /** Enum used only by the service-layer filter. */
    enum PaymentStatusFilter {
        ALL, PAID, PENDING, OVERDUE
    }

    /** Tiny input record so the interface doesn't leak the enums package. */
    record PaymentMethodInput(String method) {
    }
}
