package com.pata.keja.scheduler;

import com.pata.keja.enums.NotificationKind;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.models.Payment;
import com.pata.keja.repository.PaymentRepository;
import com.pata.keja.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class PaymentOverdueJob {

    private static final Logger log = LoggerFactory.getLogger(PaymentOverdueJob.class);

    private final PaymentRepository paymentRepo;
    private final NotificationService notificationService;

    public PaymentOverdueJob(PaymentRepository paymentRepo,
            NotificationService notificationService) {
        this.paymentRepo = paymentRepo;
        this.notificationService = notificationService;
    }

    /** Daily at 06:00. */
    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void markOverdue() {
        LocalDate today = LocalDate.now();
        List<Payment> overdue = paymentRepo.findOverdueCandidates(today);
        for (Payment p : overdue) {
            p.setStatus(PaymentStatus.OVERDUE);
            notificationService.emit(
                    p.getStudent().getId(),
                    NotificationKind.PAYMENT_DUE,
                    "Rent overdue",
                    "Your rent of KES " + p.getAmount() + " was due on " + p.getDueDate(),
                    "/student/payments");
        }
        if (!overdue.isEmpty()) {
            log.info("Marked {} payment(s) as overdue", overdue.size());
        }
    }
}
