package com.pata.keja.scheduler;

import com.pata.keja.service.InvitationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InvitationExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(InvitationExpiryJob.class);

    private final InvitationService invitationService;

    public InvitationExpiryJob(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    /** Every hour on the hour. */
    @Scheduled(cron = "0 0 * * * *")
    public void expireInvitations() {
        int count = invitationService.expireOverdueInvitations();
        if (count > 0) {
            log.info("Marked {} invitation(s) as expired", count);
        }
    }
}
