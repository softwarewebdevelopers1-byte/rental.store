package com.pata.keja.service.impl;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.mapper.StudentMapper;
import com.pata.keja.models.Room;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.models.Student;

@Service
public class LandlordRequestService {

    private final StudentRepository studentRepo;
    private final RoomRepository roomRepo;
    private final StudentMapper studentMapper;

    // constructor injection …

    @Transactional
    public void accept(String landlordId, String studentId) {
        Student s = studentRepo.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (s.getRequestedHostel() == null
                || !s.getRequestedHostel().getLandlord().getId().equals(landlordId)) {
            throw new AccessDeniedException("Not your request");
        }

        Room vacant = roomRepo.findFirstByHostelIdAndStatus(
                s.getRequestedHostel().getId(), RoomStatus.VACANT)
                .orElseThrow(() -> new ConflictException("No vacant rooms"));

        s.setHostel(s.getRequestedHostel());
        s.setRoom(vacant);
        s.setRequestedHostel(null);
        s.setMembershipStatus(MembershipStatus.ACTIVE);
        s.setActivatedAt(Instant.now());

        vacant.setStatus(RoomStatus.BOOKED);
        // roomRepo.save(vacant) — or rely on dirty checking inside @Transactional
    }
}
