package com.pata.keja.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

import com.pata.keja.repository.BookingRequestRepository;
import com.pata.keja.service.impl.PayHeroPaymentService;

@Component
public class PayHeroPaymentStatusJob {

    private static final Logger log = LoggerFactory.getLogger(PayHeroPaymentStatusJob.class);
    private static final int BATCH_SIZE = 50;

    private final BookingRequestRepository bookingRequestRepository;
    private final PayHeroPaymentService paymentService;
    private final AtomicInteger nextPage = new AtomicInteger();

    public PayHeroPaymentStatusJob(
            BookingRequestRepository bookingRequestRepository,
            PayHeroPaymentService paymentService) {
        this.bookingRequestRepository = bookingRequestRepository;
        this.paymentService = paymentService;
    }

    @Scheduled(fixedDelayString = "${app.payments.payhero.status-poll-interval-ms:60000}")
    public void refreshPendingPayments() {
        var firstPage = bookingRequestRepository.findPendingPayHeroPayments(PageRequest.of(0, BATCH_SIZE));
        int pageCount = firstPage.getTotalPages();
        if (pageCount == 0) {
            nextPage.set(0);
            return;
        }
        int page = Math.floorMod(nextPage.getAndIncrement(), pageCount);
        var pendingBookings = page == 0
                ? firstPage
                : bookingRequestRepository.findPendingPayHeroPayments(PageRequest.of(page, BATCH_SIZE));
        pendingBookings
                .forEach(booking -> {
                    try {
                        paymentService.refreshPendingStatus(
                                booking.getId(), booking.getStudent().getId());
                    } catch (RuntimeException ex) {
                        log.warn("Unable to refresh PayHero payment status for booking {}",
                                booking.getId(), ex);
                    }
                });
    }
}
