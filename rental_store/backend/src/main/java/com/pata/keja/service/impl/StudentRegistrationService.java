package com.pata.keja.service.impl;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pata.keja.dto.student.StudentRegistrationRequest;
import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.UserRoles;
import com.pata.keja.mapper.StudentMapper;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Student;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.StudentRepository;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Service
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class StudentRegistrationService {

    private final StudentRepository studentRepo;
    private final HostelRepository hostelRepo;
    private final PasswordEncoder passwordEncoder;
    private final StudentMapper studentMapper;

    // constructor injection …

    @Transactional
    public StudentResponse register(StudentRegistrationRequest req) {
        if (studentRepo.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already in use");
        }
        Hostel hostel = hostelRepo.findByCodeIgnoreCase(req.hostelCode())
                .orElseThrow(() -> new ValidationException("Invalid hostel code"));

        Student student = new Student();
        student.setName(req.name());
        student.setEmail(req.email().toLowerCase());
        student.setPasswordHash(passwordEncoder.encode(req.password()));
        student.setRole(UserRoles.STUDENT);
        student.setActive(true);

        student.setRequestedHostel(hostel);
        student.setRegistrationHostelCode(hostel.getCode());
        student.setMembershipStatus(MembershipStatus.PENDING);
        student.setRequestedAt(Instant.now());

        studentRepo.save(student);

        return studentMapper.toResponse(student);
    }
}
