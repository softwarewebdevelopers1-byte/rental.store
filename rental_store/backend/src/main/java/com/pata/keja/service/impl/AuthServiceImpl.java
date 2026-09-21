package com.pata.keja.service.impl;

import com.pata.keja.dto.admin.UserSummaryResponse;
import com.pata.keja.dto.auth.HostelCodeValidationResponse;
import com.pata.keja.dto.auth.LoginRequest;
import com.pata.keja.dto.auth.LoginResponse;
import com.pata.keja.dto.student.StudentRegistrationRequest;
import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.User;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.UserRepository;
import com.pata.keja.service.AuthService;
import com.pata.keja.security.JwtService;
import com.pata.keja.exception.NotFoundException;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentRegistrationService studentRegistrationService;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository,
            HostelRepository hostelRepository,
            PasswordEncoder passwordEncoder,
            StudentRegistrationService studentRegistrationService,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.hostelRepository = hostelRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentRegistrationService = studentRegistrationService;
        this.jwtService = jwtService;
    }

    @Override
    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(req.email())
                .filter(User::isActive)
                .filter(candidate -> candidate.getPasswordHash() != null
                        && passwordEncoder.matches(req.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        return new LoginResponse(
                jwtService.issueToken(user),
                new UserSummaryResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getAvatarUrl(),
                        user.getRole(),
                        user.isActive(),
                        user.getCreatedAt()));
    }

    @Override
    public void requestPasswordReset(String email) {
        userRepository.findByEmailIgnoreCase(email);
    }

    @Override
    @Transactional(readOnly = true)
    public HostelCodeValidationResponse validateHostelCode(String code) {
        Hostel hostel = hostelRepository.findByCodeIgnoreCase(code)
                .filter(Hostel::isActive)
                .orElse(null);
        return hostel == null
                ? new HostelCodeValidationResponse(false, null, null)
                : new HostelCodeValidationResponse(true, hostel.getId(), hostel.getName());
    }

    @Override
    public StudentResponse registerStudent(StudentRegistrationRequest req) {
        return studentRegistrationService.register(req);
    }
}
