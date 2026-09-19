package com.pata.keja.service.impl;

import java.time.Instant;

import com.pata.keja.dto.student.ChangeHostelRequest;
import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.dto.student.StudentRoleFilter;
import com.pata.keja.dto.student.StudentSummaryResponse;
import com.pata.keja.dto.student.StudentUpdateRequest;
import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.StudentMapper;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Student;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.security.CurrentUserProvider;
import com.pata.keja.service.StudentService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;
    private final StudentMapper studentMapper;

    public StudentServiceImpl(StudentRepository studentRepository,
            HostelRepository hostelRepository,
            StudentMapper studentMapper) {
        this.studentRepository = studentRepository;
        this.hostelRepository = hostelRepository;
        this.studentMapper = studentMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getCurrent() {
        return getById(CurrentUserProvider.requireUserId());
    }

    @Override
    public StudentResponse updateCurrent(StudentUpdateRequest req) {
        Student student = requireStudent(CurrentUserProvider.requireUserId());
        if (req.email() != null && !req.email().equalsIgnoreCase(student.getEmail())
                && studentRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already in use");
        }
        if (req.name() != null) {
            student.setName(req.name());
        }
        if (req.email() != null) {
            student.setEmail(req.email().toLowerCase());
        }
        if (req.phone() != null) {
            student.setPhone(req.phone());
        }
        if (req.avatarUrl() != null) {
            student.setAvatarUrl(req.avatarUrl());
        }
        if (req.active() != null) {
            student.setActive(req.active());
        }
        return studentMapper.toResponse(student);
    }

    @Override
    public StudentResponse changeHostel(ChangeHostelRequest req) {
        Student student = requireStudent(CurrentUserProvider.requireUserId());
        Hostel hostel = hostelRepository.findByCodeIgnoreCase(req.newHostelCode())
                .filter(Hostel::isActive)
                .orElseThrow(() -> new NotFoundException("Hostel not found"));
        student.setRequestedHostel(hostel);
        student.setRequestedAt(Instant.now());
        student.setMembershipStatus(MembershipStatus.PENDING);
        return studentMapper.toResponse(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getById(String id) {
        return studentMapper.toResponse(requireStudent(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentSummaryResponse> list(StudentRoleFilter filter, Pageable pageable) {
        Page<Student> students = filter == null || filter.membershipStatus() == null
                ? studentRepository.findAll(pageable)
                : studentRepository.findAllByMembershipStatus(filter.membershipStatus(), pageable);
        return students.map(studentMapper::toSummary);
    }

    private Student requireStudent(String id) {
        return studentRepository.findWithAssociationsById(id)
                .orElseThrow(() -> new NotFoundException("Student not found"));
    }
}
