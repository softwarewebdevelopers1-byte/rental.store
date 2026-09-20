package com.pata.keja.controller;

import jakarta.validation.Valid;

import com.pata.keja.dto.account.AccountUpdateRequest;
import com.pata.keja.dto.admin.UserSummaryResponse;
import com.pata.keja.service.AccountService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
@PreAuthorize("isAuthenticated()")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PatchMapping("/me")
    public UserSummaryResponse updateCurrent(@Valid @RequestBody AccountUpdateRequest request) {
        return accountService.updateCurrent(request);
    }
}
