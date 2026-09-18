package com.pata.keja.mapper;

import com.pata.keja.dto.conflict.ConflictResponse;
import com.pata.keja.dto.conflict.ConflictSummaryResponse;
import com.pata.keja.models.Admin;
import com.pata.keja.models.Conflict;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ConflictMapper {

    public ConflictSummaryResponse toSummary(Conflict c) {
        return new ConflictSummaryResponse(
                c.getId(),
                c.getOrder().getId(),
                c.getIssue(),
                c.getStatus(),
                c.getStudent().getId(),
                c.getStudent().getName(),
                c.getAgent().getId(),
                c.getAgent().getName(),
                c.getCreatedAt(),
                c.getResolvedAt());
    }

    public ConflictResponse toResponse(Conflict c) {
        Admin resolver = c.getResolvedBy();
        return new ConflictResponse(
                c.getId(),
                c.getOrder().getId(),
                c.getOrder().getTotal(),
                c.getIssue(),
                c.getDescription(),
                c.getStatus(),

                c.getStudent().getId(),
                c.getStudent().getName(),
                c.getStudent().getEmail(),

                c.getAgent().getId(),
                c.getAgent().getName(),
                c.getAgent().getEmail(),

                resolver != null ? resolver.getId() : null,
                resolver != null ? resolver.getName() : null,
                c.getResolution(),
                c.getResolvedAt(),

                List.copyOf(c.getAttachments()),

                c.getCreatedAt(),
                c.getUpdatedAt());
    }
}
