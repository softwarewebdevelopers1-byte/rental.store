package com.pata.keja.service.impl;

import com.pata.keja.dto.account.AccountUpdateRequest;
import com.pata.keja.dto.admin.UserSummaryResponse;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.models.User;
import com.pata.keja.repository.UserRepository;
import com.pata.keja.security.CurrentUserProvider;
import com.pata.keja.service.AccountService;
import com.pata.keja.service.StorageService;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;

    public AccountServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
            StorageService storageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.storageService = storageService;
    }

    @Override
    public UserSummaryResponse updateCurrent(AccountUpdateRequest request) {
        User user = userRepository.findById(CurrentUserProvider.requireUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Email already in use");
        }

        boolean changingPassword = request.newPassword() != null
                && !request.newPassword().isBlank();
        if (changingPassword && (request.currentPassword() == null
                || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash()))) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (request.email() != null && !request.email().isBlank()) {
            user.setEmail(request.email().trim().toLowerCase());
        }
        if (changingPassword) {
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }
        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            if (!storageService.ownsUrl(request.avatarUrl())) {
                throw new ConflictException("Avatar URL does not belong to configured storage");
            }
            user.setAvatarUrl(request.avatarUrl());
        }

        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt());
    }
}
