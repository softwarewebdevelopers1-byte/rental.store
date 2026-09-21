package com.pata.keja.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.pata.keja.dto.payment.LandlordPaymentStatsResponse;
import com.pata.keja.dto.payment.PaymentCreateRequest;
import com.pata.keja.dto.payment.PaymentBatchRecordRequest;
import com.pata.keja.dto.payment.PaymentHistoryFilter;
import com.pata.keja.dto.payment.PaymentRecordRequest;
import com.pata.keja.dto.payment.LandlordPaymentSummaryResponse;
import com.pata.keja.dto.hostel.CaretakerPaymentPermissionRequest;
import com.pata.keja.dto.hostel.HostelPaymentRecorderResponse;
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

    PaymentResponse recordForLandlord(String landlordId, PaymentRecordRequest request);

    PaymentResponse recordForCaretaker(String caretakerId, PaymentRecordRequest request);

    java.util.List<com.pata.keja.dto.payment.PaymentSummaryResponse> recordBatch(
            String landlordId, PaymentBatchRecordRequest request);

    Page<PaymentSummaryResponse> searchForLandlord(
            String landlordId, PaymentHistoryFilter filter, Pageable pageable);

    Page<PaymentSummaryResponse> searchForCaretaker(
            String caretakerId, PaymentHistoryFilter filter, Pageable pageable);

    LandlordPaymentSummaryResponse summaryForLandlord(String landlordId);

    LandlordPaymentSummaryResponse summaryForCaretaker(String caretakerId);

    HostelPaymentRecorderResponse listPaymentRecorders(String landlordId, String hostelId);

    HostelPaymentRecorderResponse setPaymentRecorder(
            String landlordId, String hostelId, CaretakerPaymentPermissionRequest request);

    /** Enum used only by the service-layer filter. */
    enum PaymentStatusFilter {
        ALL, PAID, PENDING, OVERDUE
    }

    /** Tiny input record so the interface doesn't leak the enums package. */
    record PaymentMethodInput(String method) {
    }
}
