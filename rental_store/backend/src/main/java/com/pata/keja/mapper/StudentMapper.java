package com.pata.keja.mapper;

import org.springframework.stereotype.Component;

import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.dto.student.StudentSummaryResponse;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Room;
import com.pata.keja.models.Student;

@Component
public class StudentMapper {

    public StudentSummaryResponse toSummary(Student s) {
        Hostel hostel = s.getHostel();
        Room room = s.getRoom();
        Hostel requested = s.getRequestedHostel();
        return new StudentSummaryResponse(
                s.getId(),
                s.getName(),
                s.getEmail(),
                s.getPhone(),
                s.getAvatarUrl(),
                s.isActive(),
                s.getMembershipStatus(),
                hostel != null ? hostel.getId() : null,
                hostel != null ? hostel.getName() : null,
                room != null ? room.getId() : null,
                room != null ? room.getNumber() : null,
                requested != null ? requested.getId() : null,
                requested != null ? requested.getName() : null,
                s.getCreatedAt());
    }

    public StudentResponse toResponse(Student s) {
        Hostel hostel = s.getHostel();
        Room room = s.getRoom();
        Hostel requested = s.getRequestedHostel();

        return new StudentResponse(
                s.getId(),
                s.getName(),
                s.getEmail(),
                s.getPhone(),
                s.getAvatarUrl(),
                s.getRole(),
                s.isActive(),
                s.getMembershipStatus(),

                hostel != null ? hostel.getId() : null,
                hostel != null ? hostel.getName() : null,
                hostel != null ? hostel.getLocation() : null,
                room != null ? room.getId() : null,
                room != null ? room.getNumber() : null,
                room != null ? room.getPrice() : null,

                requested != null ? requested.getId() : null,
                requested != null ? requested.getName() : null,
                s.getRegistrationHostelCode(),

                s.getRequestedAt(),
                s.getActivatedAt(),
                s.getCreatedAt(),
                s.getUpdatedAt());
    }
}
