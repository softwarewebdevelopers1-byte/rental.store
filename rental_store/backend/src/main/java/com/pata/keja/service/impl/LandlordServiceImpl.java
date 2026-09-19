package com.pata.keja.service.impl;

import java.time.Instant;

import com.pata.keja.dto.landlord.LandlordResponse;
import com.pata.keja.dto.landlord.LandlordStatsResponse;
import com.pata.keja.dto.landlord.LandlordSummaryResponse;
import com.pata.keja.dto.landlord.LandlordUpdateRequest;
import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.LandlordMapper;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Landlord;
import com.pata.keja.repository.LandlordRepository;
import com.pata.keja.repository.PaymentRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.security.CurrentUserProvider;
import com.pata.keja.service.LandlordService;
import com.pata.keja.service.MessageService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LandlordServiceImpl implements LandlordService {

    private final LandlordRepository landlordRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final PaymentRepository paymentRepository;
    private final LandlordMapper landlordMapper;
    private final MessageService messageService;

    public LandlordServiceImpl(LandlordRepository landlordRepository,
            StudentRepository studentRepository,
            RoomRepository roomRepository,
            PaymentRepository paymentRepository,
            LandlordMapper landlordMapper,
            MessageService messageService) {
        this.landlordRepository = landlordRepository;
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.paymentRepository = paymentRepository;
        this.landlordMapper = landlordMapper;
        this.messageService = messageService;
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordResponse getCurrent() {
        return getById(CurrentUserProvider.requireUserId());
    }

    @Override
    public LandlordResponse updateCurrent(LandlordUpdateRequest req) {
        Landlord landlord = requireLandlord(CurrentUserProvider.requireUserId());
        if (req.email() != null && !req.email().equalsIgnoreCase(landlord.getEmail())
                && landlordRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already in use");
        }
        if (req.name() != null) {
            landlord.setName(req.name());
        }
        if (req.email() != null) {
            landlord.setEmail(req.email().toLowerCase());
        }
        if (req.phone() != null) {
            landlord.setPhone(req.phone());
        }
        if (req.avatarUrl() != null) {
            landlord.setAvatarUrl(req.avatarUrl());
        }
        if (req.active() != null) {
            landlord.setActive(req.active());
        }
        return landlordMapper.toResponse(landlord);
    }

    @Override
    public LandlordResponse requestVerification() {
        Landlord landlord = requireLandlord(CurrentUserProvider.requireUserId());
        landlord.setVerificationStatus(com.pata.keja.enums.VerificationStatus.PENDING);
        landlord.setVerificationRequestedAt(Instant.now());
        return landlordMapper.toResponse(landlord);
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordStatsResponse getStats() {
        Landlord landlord = requireLandlord(CurrentUserProvider.requireUserId());
        int totalHostels = landlord.getHostels().size();
        int totalRooms = 0;
        int vacantRooms = 0;
        int bookedRooms = 0;
        int activeTenants = 0;
        int pendingRequests = 0;
        int outstandingPayments = 0;

        for (Hostel hostel : landlord.getHostels()) {
            totalRooms += hostel.getRooms().size();
            vacantRooms += (int) hostel.getRooms().stream()
                    .filter(room -> room.getStatus() == RoomStatus.VACANT).count();
            bookedRooms += (int) hostel.getRooms().stream()
                    .filter(room -> room.getStatus() == RoomStatus.BOOKED).count();
            activeTenants += studentRepository.findActiveTenantsForHostel(hostel.getId()).size();
            pendingRequests += studentRepository.findPendingRequestsForHostel(hostel.getId()).size();
            outstandingPayments += (int) hostel.getRooms().stream()
                    .map(room -> room.getTenant())
                    .filter(java.util.Objects::nonNull)
                    .count();
            outstandingPayments += paymentRepository.findStudentIdsWithOutstandingPayments(hostel.getId()).size();
        }

        return new LandlordStatsResponse(
                totalHostels,
                totalRooms,
                vacantRooms,
                bookedRooms,
                activeTenants,
                pendingRequests,
                outstandingPayments,
                (int) messageService.unreadCountForUser(landlord.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordResponse getById(String id) {
        return landlordMapper.toResponse(landlordRepository.findByIdWithHostels(id)
                .orElseThrow(() -> new NotFoundException("Landlord not found")));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LandlordSummaryResponse> list(Pageable pageable) {
        return landlordRepository.findAll(pageable).map(landlordMapper::toSummary);
    }

    private Landlord requireLandlord(String id) {
        return landlordRepository.findByIdWithHostels(id)
                .orElseThrow(() -> new NotFoundException("Landlord not found"));
    }
}
