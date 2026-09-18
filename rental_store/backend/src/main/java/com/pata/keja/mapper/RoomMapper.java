package com.pata.keja.mapper;

import org.springframework.stereotype.Component;

import com.pata.keja.dto.room.RoomResponse;
import com.pata.keja.dto.room.RoomSummaryResponse;
import com.pata.keja.models.Room;
import com.pata.keja.models.Student;

@Component
public class RoomMapper {

    public RoomSummaryResponse toSummary(Room r) {
        Student tenant = r.getTenant();
        return new RoomSummaryResponse(
                r.getId(),
                r.getHostel().getId(),
                r.getNumber(),
                r.getPrice(),
                r.getStatus(),
                tenant != null ? tenant.getId() : null,
                tenant != null ? tenant.getName() : null);
    }

    public RoomResponse toResponse(Room r) {
        Student tenant = r.getTenant();
        return new RoomResponse(
                r.getId(),

                r.getHostel().getId(),
                r.getHostel().getName(),
                r.getHostel().getLocation(),

                r.getNumber(),
                r.getPrice(),
                r.getStatus(),

                tenant != null ? tenant.getId() : null,
                tenant != null ? tenant.getName() : null,
                tenant != null ? tenant.getEmail() : null,

                r.getCreatedAt(),
                r.getUpdatedAt());
    }
}
