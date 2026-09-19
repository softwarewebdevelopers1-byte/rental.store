package com.pata.keja.service.impl;

import java.util.List;

import com.pata.keja.dto.caretaker.CaretakerResponse;
import com.pata.keja.dto.caretaker.CaretakerStatsResponse;
import com.pata.keja.dto.caretaker.CaretakerSummaryResponse;
import com.pata.keja.dto.hostel.HostelSummaryResponse;
import com.pata.keja.dto.student.StudentSummaryResponse;
import com.pata.keja.enums.MaintenanceStatus;
import com.pata.keja.mapper.HostelMapper;
import com.pata.keja.mapper.StudentMapper;
import com.pata.keja.models.Caretaker;
import com.pata.keja.models.Hostel;
import com.pata.keja.repository.CaretakerRepository;
import com.pata.keja.repository.MaintenanceRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.security.CurrentUserProvider;
import com.pata.keja.service.CaretakerService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CaretakerServiceImpl implements CaretakerService {

    private final CaretakerRepository caretakerRepository;
    private final StudentRepository studentRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final HostelMapper hostelMapper;
    private final StudentMapper studentMapper;

    public CaretakerServiceImpl(CaretakerRepository caretakerRepository,
            StudentRepository studentRepository,
            MaintenanceRepository maintenanceRepository,
            HostelMapper hostelMapper,
            StudentMapper studentMapper) {
        this.caretakerRepository = caretakerRepository;
        this.studentRepository = studentRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.hostelMapper = hostelMapper;
        this.studentMapper = studentMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public CaretakerResponse getCurrent() {
        return toResponse(requireCaretaker(CurrentUserProvider.requireUserId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HostelSummaryResponse> listAssignedHostels() {
        return requireCaretaker(CurrentUserProvider.requireUserId()).getAssignedHostels().stream()
                .filter(Hostel::isActive)
                .map(hostelMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentSummaryResponse> listTenants(Pageable pageable) {
        List<String> hostelIds = requireCaretaker(CurrentUserProvider.requireUserId()).getAssignedHostels().stream()
                .map(Hostel::getId)
                .toList();
        if (hostelIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return studentRepository.findAllByHostelIdInAndMembershipStatus(
                hostelIds, com.pata.keja.enums.MembershipStatus.ACTIVE, pageable)
                .map(studentMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CaretakerSummaryResponse> list(Pageable pageable) {
        return caretakerRepository.findAll(pageable).map(this::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public CaretakerStatsResponse stats() {
        Caretaker caretaker = requireCaretaker(CurrentUserProvider.requireUserId());
        int totalTenants = 0;
        int open = 0;
        int inProgress = 0;
        int resolved = 0;
        for (Hostel hostel : caretaker.getAssignedHostels()) {
            totalTenants += studentRepository.findActiveTenantsForHostel(hostel.getId()).size();
            open += maintenanceRepository.countByHostelIdAndStatus(hostel.getId(), MaintenanceStatus.OPEN);
            inProgress += maintenanceRepository.countByHostelIdAndStatus(hostel.getId(), MaintenanceStatus.IN_PROGRESS);
            resolved += maintenanceRepository.countByHostelIdAndStatus(hostel.getId(), MaintenanceStatus.RESOLVED);
            resolved += maintenanceRepository.countByHostelIdAndStatus(hostel.getId(), MaintenanceStatus.CLOSED);
        }
        return new CaretakerStatsResponse(caretaker.getAssignedHostels().size(), totalTenants, open, inProgress, resolved);
    }

    private Caretaker requireCaretaker(String id) {
        return caretakerRepository.findByIdWithHostels(id)
                .orElseThrow(() -> new com.pata.keja.exception.NotFoundException("Caretaker not found"));
    }

    private CaretakerResponse toResponse(Caretaker caretaker) {
        return new CaretakerResponse(
                caretaker.getId(), caretaker.getName(), caretaker.getEmail(), caretaker.getPhone(),
                caretaker.getAvatarUrl(), caretaker.getRole(), caretaker.isActive(),
                caretaker.getAssignedHostels().stream().map(Hostel::getId).toList(),
                caretaker.getCreatedAt(), caretaker.getUpdatedAt());
    }

    private CaretakerSummaryResponse toSummary(Caretaker caretaker) {
        return new CaretakerSummaryResponse(
                caretaker.getId(), caretaker.getName(), caretaker.getEmail(), caretaker.isActive(),
                caretaker.getAssignedHostels().stream().map(Hostel::getId).toList(), caretaker.getCreatedAt());
    }
}
