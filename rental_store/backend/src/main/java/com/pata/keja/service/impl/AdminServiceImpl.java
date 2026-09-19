package com.pata.keja.service.impl;

import com.pata.keja.enums.UserRoles;
import com.pata.keja.enums.ConflictStatus;
import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.enums.VerificationStatus;
import com.pata.keja.dto.admin.AdminCreateRequest;
import com.pata.keja.dto.admin.AdminResponse;
import com.pata.keja.dto.admin.AdminSummaryResponse;
import com.pata.keja.dto.admin.AdminUserUpdateRequest;
import com.pata.keja.dto.admin.PlatformStatsResponse;
import com.pata.keja.dto.admin.UserSummaryResponse;
import com.pata.keja.dto.hostel.HostelSummaryResponse;
import com.pata.keja.dto.landlord.LandlordResponse;
import com.pata.keja.dto.landlord.LandlordSummaryResponse;
import com.pata.keja.dto.landlord.VerificationDecisionRequest;
import com.pata.keja.models.Admin;
import com.pata.keja.models.User;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.AdminMapper;
import com.pata.keja.mapper.HostelMapper;
import com.pata.keja.mapper.LandlordMapper;
import com.pata.keja.repository.AdminRepository;
import com.pata.keja.repository.CaretakerRepository;
import com.pata.keja.repository.ConflictRepository;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.LandlordRepository;
import com.pata.keja.repository.MarketAgentRepository;
import com.pata.keja.repository.OrderRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.repository.UserRepository;
import com.pata.keja.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AdminMapper adminMapper;
    private final LandlordRepository landlordRepo;
    private final StudentRepository studentRepo;
    private final CaretakerRepository caretakerRepo;
    private final MarketAgentRepository agentRepo;
    private final HostelRepository hostelRepo;
    private final RoomRepository roomRepo;
    private final OrderRepository orderRepo;
    private final ConflictRepository conflictRepo;
    private final LandlordMapper landlordMapper;
    private final HostelMapper hostelMapper;

    public AdminServiceImpl(AdminRepository adminRepo,
            UserRepository userRepo,
            PasswordEncoder passwordEncoder,
            AdminMapper adminMapper,
            LandlordRepository landlordRepo,
            StudentRepository studentRepo,
            CaretakerRepository caretakerRepo,
            MarketAgentRepository agentRepo,
            HostelRepository hostelRepo,
            RoomRepository roomRepo,
            OrderRepository orderRepo,
            ConflictRepository conflictRepo,
            LandlordMapper landlordMapper,
            HostelMapper hostelMapper) {
        this.adminRepo = adminRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.adminMapper = adminMapper;
        this.landlordRepo = landlordRepo;
        this.studentRepo = studentRepo;
        this.caretakerRepo = caretakerRepo;
        this.agentRepo = agentRepo;
        this.hostelRepo = hostelRepo;
        this.roomRepo = roomRepo;
        this.orderRepo = orderRepo;
        this.conflictRepo = conflictRepo;
        this.landlordMapper = landlordMapper;
        this.hostelMapper = hostelMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminSummaryResponse> list(Pageable pageable) {
        return adminRepo.findAll(pageable).map(adminMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminResponse getById(String adminId) {
        Admin a = adminRepo.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Admin not found"));
        return adminMapper.toResponse(a);
    }

    @Override
    public AdminResponse create(AdminCreateRequest req) {
        if (userRepo.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already in use");
        }
        Admin admin = new Admin();
        admin.setName(req.name());
        admin.setEmail(req.email().toLowerCase());
        admin.setPhone(req.phone());
        admin.setRole(UserRoles.ADMIN);
        admin.setActive(true);
        // No password yet — the admin redeems an invitation to set one.
        // Or you can generate a temporary password and email it via your mail service.
        adminRepo.save(admin);
        return adminMapper.toResponse(admin);
    }

    @Override
    public void setActive(String adminId, boolean active) {
        Admin a = adminRepo.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Admin not found"));
        a.setActive(active);
    }

    @Override
    @Transactional(readOnly = true)
    public PlatformStatsResponse stats() {
        return new PlatformStatsResponse(
                userRepo.countByRole(UserRoles.STUDENT),
                userRepo.countByRole(UserRoles.LANDLORD),
                userRepo.countByRole(UserRoles.CARETAKER),
                userRepo.countByRole(UserRoles.MARKET_AGENT),
                hostelRepo.countByActiveTrue(),
                roomRepo.count(),
                roomRepo.countByStatus(RoomStatus.VACANT),
                roomRepo.countByStatus(RoomStatus.BOOKED),
                landlordRepo.countByVerificationStatus(VerificationStatus.PENDING),
                studentRepo.countByMembershipStatus(MembershipStatus.PENDING),
                orderRepo.count(),
                conflictRepo.countByStatus(ConflictStatus.OPEN) + conflictRepo.countByStatus(ConflictStatus.IN_REVIEW));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LandlordSummaryResponse> listVerificationRequests(Pageable pageable) {
        return landlordRepo.findAllByVerificationStatus(VerificationStatus.PENDING, pageable)
                .map(landlordMapper::toSummary);
    }

    @Override
    public LandlordResponse decideVerification(String landlordId, VerificationDecisionRequest req) {
        var landlord = landlordRepo.findByIdWithHostels(landlordId)
                .orElseThrow(() -> new NotFoundException("Landlord not found"));
        if (req.decision() != VerificationStatus.APPROVED && req.decision() != VerificationStatus.REJECTED) {
            throw new ConflictException("Verification decision must be APPROVED or REJECTED");
        }
        landlord.setVerificationStatus(req.decision());
        landlord.setVerificationNotes(req.notes());
        landlord.setVerificationDecidedAt(java.time.Instant.now());
        return landlordMapper.toResponse(landlord);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> listUsers(String q, UserRoles role, Pageable pageable) {
        String needle = q == null || q.isBlank() ? null : q.trim();
        return userRepo.search(needle, role, pageable).map(this::toUserSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> listUsersByIds(List<String> ids, Pageable pageable) {
        List<UserSummaryResponse> users = userRepo.findAllById(ids).stream()
                .map(this::toUserSummary)
                .toList();
        return new PageImpl<>(users, pageable, users.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HostelSummaryResponse> listHostels(Pageable pageable) {
        return hostelRepo.findAllForAdmin(pageable).map(hostelMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryResponse getUser(String userId) {
        return userRepo.findById(userId)
                .map(this::toUserSummary)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    public UserSummaryResponse updateUser(String userId, AdminUserUpdateRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (req.email() != null && !req.email().equalsIgnoreCase(user.getEmail())
                && userRepo.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already in use");
        }
        if (req.name() != null) user.setName(req.name());
        if (req.email() != null) user.setEmail(req.email().toLowerCase());
        if (req.active() != null) user.setActive(req.active());
        return toUserSummary(user);
    }

    private UserSummaryResponse toUserSummary(User user) {
        return new UserSummaryResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.isActive(), user.getCreatedAt());
    }
}
