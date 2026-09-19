package com.pata.keja.service.impl;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pata.keja.dto.student.StudentRegistrationRequest;
import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.UserRoles;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.mapper.StudentMapper;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Student;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.StudentRepository;
import jakarta.validation.ValidationException;

import lombok.Getter;
import lombok.Setter;

@Service
@Getter
@Setter
public class StudentRegistrationService {

    private final StudentRepository studentRepo;
    private final HostelRepository hostelRepo;
    private final PasswordEncoder passwordEncoder;
    private final StudentMapper studentMapper;

    public StudentRegistrationService(StudentRepository studentRepo,
            HostelRepository hostelRepo,
            PasswordEncoder passwordEncoder,
            StudentMapper studentMapper) {
        this.studentRepo = studentRepo;
        this.hostelRepo = hostelRepo;
        this.passwordEncoder = passwordEncoder;
        this.studentMapper = studentMapper;
    }

    @Transactional
    public StudentResponse register(StudentRegistrationRequest req) {
        if (studentRepo.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already in use");
        }
        Student student = new Student();
        student.setName(req.name());
        student.setEmail(req.email().toLowerCase());
        student.setPasswordHash(passwordEncoder.encode(req.password()));
        student.setRole(UserRoles.STUDENT);
        student.setActive(true);

        student.setMembershipStatus(MembershipStatus.PENDING);
        if (req.hostelCode() != null && !req.hostelCode().isBlank()) {
            Hostel hostel = hostelRepo.findByCodeIgnoreCase(req.hostelCode().trim())
                    .orElseThrow(() -> new ValidationException("Invalid hostel code"));
            student.setRequestedHostel(hostel);
            student.setRegistrationHostelCode(hostel.getCode());
            student.setRequestedAt(Instant.now());
        }

        studentRepo.save(student);

        return studentMapper.toResponse(student);
    }
}
