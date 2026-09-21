package com.pata.keja.mapper;

import com.pata.keja.dto.invitation.InvitationResponse;
import com.pata.keja.dto.invitation.InvitationSummaryResponse;
import com.pata.keja.models.Invitation;
import com.pata.keja.models.User;
import org.springframework.stereotype.Component;

@Component
public class InvitationMapper {

    public InvitationSummaryResponse toSummary(Invitation i) {
        return new InvitationSummaryResponse(
                i.getId(),
                i.getToken(),
                i.getKind(),
                i.getEmail(),
                i.getStatus(),
                i.getCreatedAt(),
                i.getExpiresAt());
    }

    public InvitationResponse toResponse(Invitation i) {
        User createdBy = i.getCreatedBy();
        User usedBy = i.getUsedBy();
        return new InvitationResponse(
                i.getId(),
                i.getToken(),
                i.getKind(),
                i.getEmail(),
                i.getStatus(),

                createdBy != null ? createdBy.getId() : null,
                createdBy != null ? createdBy.getName() : null,
                usedBy != null ? usedBy.getId() : null,
                usedBy != null ? usedBy.getName() : null,

                i.getCreatedAt(),
                i.getExpiresAt(),
                i.getUsedAt(),
                i.getRevokedAt());
    }
}
