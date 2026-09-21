package com.pata.keja.service.impl;

import com.pata.keja.enums.*;
import com.pata.keja.dto.invitation.InvitationCreateRequest;
import com.pata.keja.dto.invitation.InvitationResponse;
import com.pata.keja.dto.invitation.InvitationSummaryResponse;
import com.pata.keja.models.*;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.InvitationMapper;
import com.pata.keja.repository.*;
import com.pata.keja.service.InvitationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@Transactional
public class InvitationServiceImpl implements InvitationService {

    private static final int DEFAULT_EXPIRY_DAYS = 30;
    private static final int MAX_EXPIRY_DAYS = 365;
    private static final int MAX_EXPIRY_HOURS = MAX_EXPIRY_DAYS * 24;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final InvitationRepository invitationRepo;
    private final AdminRepository adminRepo;
    private final LandlordRepository landlordRepo;
    private final UserRepository userRepo;
    private final HostelRepository hostelRepo;
    private final MarketAgentRepository agentRepo;
    private final CaretakerRepository caretakerRepo;
    private final PasswordEncoder passwordEncoder;
    private final InvitationMapper invitationMapper;

    public InvitationServiceImpl(InvitationRepository invitationRepo,
            AdminRepository adminRepo,
            LandlordRepository landlordRepo,
            UserRepository userRepo,
            HostelRepository hostelRepo,
            MarketAgentRepository agentRepo,
            CaretakerRepository caretakerRepo,
            PasswordEncoder passwordEncoder,
            InvitationMapper invitationMapper) {
        this.invitationRepo = invitationRepo;
        this.adminRepo = adminRepo;
        this.landlordRepo = landlordRepo;
        this.userRepo = userRepo;
        this.hostelRepo = hostelRepo;
        this.agentRepo = agentRepo;
        this.caretakerRepo = caretakerRepo;
        this.passwordEncoder = passwordEncoder;
        this.invitationMapper = invitationMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvitationSummaryResponse> list(InvitationStatus status,
            InvitationKind kind,
            Pageable pageable) {
        return invitationRepo.search(status, kind, pageable).map(invitationMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public InvitationResponse getById(String invitationId) {
        Invitation inv = invitationRepo.findByIdWithDetails(invitationId)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));
        return invitationMapper.toResponse(inv);
    }

    @Override
    @Transactional(readOnly = true)
    public InvitationResponse getByToken(String token) {
        Invitation inv = invitationRepo.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));
        return invitationMapper.toResponse(inv);
    }

    @Override
    public InvitationResponse create(String adminId, InvitationCreateRequest req) {
        Admin admin = adminRepo.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        Invitation inv = new Invitation();
        inv.setToken(generateToken());
        inv.setKind(req.kind());
        inv.setEmail(req.email() != null ? req.email().toLowerCase() : null);
        inv.setStatus(InvitationStatus.ACTIVE);
        inv.setCreatedBy(admin);
        long expiryAmount;
        ChronoUnit expiryUnit;
        if (req.expiresInHours() != null) {
            expiryAmount = Math.min(Math.max(req.expiresInHours(), 1), MAX_EXPIRY_HOURS);
            expiryUnit = ChronoUnit.HOURS;
        } else {
            int days = req.expiresInDays() != null
                    ? Math.min(Math.max(req.expiresInDays(), 1), MAX_EXPIRY_DAYS)
                    : DEFAULT_EXPIRY_DAYS;
            expiryAmount = days;
            expiryUnit = ChronoUnit.DAYS;
        }
        inv.setExpiresAt(Instant.now().plus(expiryAmount, expiryUnit));

        invitationRepo.save(inv);
        return invitationMapper.toResponse(inv);
    }

    @Override
    public InvitationResponse createForLandlord(String landlordId, String hostelId) {
        Hostel hostel = hostelRepo.findByIdWithDetails(hostelId)
                .orElseThrow(() -> new NotFoundException("Hostel not found"));
        if (!hostel.getLandlord().getId().equals(landlordId)) {
            throw new ConflictException("You do not own this hostel");
        }

        var existing = invitationRepo.findFirstByKindAndInvitedHostelIdAndStatusOrderByCreatedAtDesc(
                InvitationKind.CARETAKER, hostelId, InvitationStatus.ACTIVE);
        if (existing.isPresent() && existing.get().isRedeemable(Instant.now())) {
            return invitationMapper.toResponse(existing.get());
        }
        existing.ifPresent(inv -> inv.setStatus(InvitationStatus.EXPIRED));

        Invitation inv = new Invitation();
        inv.setToken(generateToken());
        inv.setKind(InvitationKind.CARETAKER);
        inv.setStatus(InvitationStatus.ACTIVE);
        inv.setCreatedBy(hostel.getLandlord());
        inv.setInvitedHostel(hostel);
        inv.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        invitationRepo.save(inv);
        return invitationMapper.toResponse(inv);
    }

    @Override
    public InvitationResponse revoke(String invitationId, String adminId) {
        Invitation inv = invitationRepo.findByIdWithDetails(invitationId)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));

        if (!inv.getCreatedBy().getId().equals(adminId)) {
            // Only the issuing admin (or any admin if you relax this) can revoke.
            throw new ConflictException("You can only revoke invitations you issued");
        }
        inv.revoke();
        return invitationMapper.toResponse(inv);
    }

    @Override
    public String redeem(String token, String name, String email, String password, String businessName) {
        Invitation inv = invitationRepo.findByTokenForUpdate(token)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));

        if (!inv.isRedeemable(Instant.now())) {
            throw new ConflictException("This invitation is no longer valid");
        }
        String accountEmail = inv.getEmail() != null ? inv.getEmail() : email;
        if (accountEmail == null || accountEmail.isBlank()) {
            throw new ConflictException("An email address is required to redeem this invitation");
        }
        if (userRepo.existsByEmailIgnoreCase(accountEmail)) {
            throw new ConflictException("An account with this email already exists");
        }

        User created = switch (inv.getKind()) {
            case LANDLORD -> {
                Landlord l = new Landlord();
                l.setRole(UserRoles.LANDLORD);
                yield l;
            }
            case MARKET_AGENT -> {
                MarketAgent a = new MarketAgent();
                a.setRole(UserRoles.MARKET_AGENT);
                a.setBusinessName(businessName);
                yield a;
            }
            case CARETAKER -> {
                Caretaker c = new Caretaker();
                c.setRole(UserRoles.CARETAKER);
                yield c;
            }
        };

        created.setName(name);
        created.setEmail(accountEmail.toLowerCase());
        created.setPasswordHash(passwordEncoder.encode(password));
        created.setActive(true);

        // Persist through the subtype-specific repository so Hibernate writes
        // both the base row and the subtype row.
        switch (inv.getKind()) {
            case LANDLORD -> landlordRepo.save((Landlord) created);
            case MARKET_AGENT -> agentRepo.save((MarketAgent) created);
            case CARETAKER -> {
                Caretaker caretaker = (Caretaker) created;
                if (inv.getInvitedHostel() != null) {
                    caretaker.assign(inv.getInvitedHostel());
                }
                caretakerRepo.save(caretaker);
            }
        }

        inv.markUsed(created);
        return created.getId();
    }

    @Override
    public int expireOverdueInvitations() {
        return invitationRepo.expireOverdue(Instant.now());
    }

    // ---------- helpers ----------

    /**
     * 32 bytes of randomness → URL-safe base64 without padding → 43 chars.
     * Plenty of entropy, no `/` or `+` to worry about in URLs.
     */
    private static String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
