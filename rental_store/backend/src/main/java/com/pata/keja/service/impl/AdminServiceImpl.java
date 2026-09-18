package com.pata.keja.service.impl;

import com.pata.keja.enums.UserRoles;
import com.pata.keja.dto.admin.AdminCreateRequest;
import com.pata.keja.dto.admin.AdminResponse;
import com.pata.keja.dto.admin.AdminSummaryResponse;
import com.pata.keja.models.Admin;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.AdminMapper;
import com.pata.keja.repository.AdminRepository;
import com.pata.keja.repository.UserRepository;
import com.pata.keja.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AdminMapper adminMapper;

    public AdminServiceImpl(AdminRepository adminRepo,
            UserRepository userRepo,
            PasswordEncoder passwordEncoder,
            AdminMapper adminMapper) {
        this.adminRepo = adminRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.adminMapper = adminMapper;
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
}
