package com.pata.keja.mapper;

import com.pata.keja.dto.maintenance.MaintenanceResponse;
import com.pata.keja.dto.maintenance.MaintenanceSummaryResponse;
import com.pata.keja.models.MaintenanceRequest;
import com.pata.keja.models.Room;
import com.pata.keja.models.Student;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MaintenanceMapper {

    public MaintenanceSummaryResponse toSummary(MaintenanceRequest m) {
        Student s = m.getStudent();
        Room r = m.getRoom();
        return new MaintenanceSummaryResponse(
                m.getId(),
                m.getTitle(),
                m.getCategory(),
                m.getStatus(),
                s.getId(),
                s.getName(),
                m.getHostel().getId(),
                m.getHostel().getName(),
                r != null ? r.getNumber() : null,
                m.getCreatedAt(),
                m.getUpdatedAt());
    }

    public MaintenanceResponse toResponse(MaintenanceRequest m) {
        Student s = m.getStudent();
        Room r = m.getRoom();
        return new MaintenanceResponse(
                m.getId(),
                m.getTitle(),
                m.getDescription(),
                m.getCategory(),
                m.getStatus(),

                s.getId(),
                s.getName(),
                s.getEmail(),

                m.getHostel().getId(),
                m.getHostel().getName(),
                r != null ? r.getId() : null,
                r != null ? r.getNumber() : null,

                m.getConversation() != null ? m.getConversation().getId() : null,

                List.copyOf(m.getAttachments()),

                m.getCreatedAt(),
                m.getUpdatedAt(),
                m.getResolvedAt());
    }
}
