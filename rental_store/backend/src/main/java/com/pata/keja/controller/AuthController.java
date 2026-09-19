package com.pata.keja.controller;

import java.net.URI;

import jakarta.validation.Valid;

import com.pata.keja.dto.auth.HostelCodeValidationResponse;
import com.pata.keja.dto.auth.LoginRequest;
import com.pata.keja.dto.auth.LoginResponse;
import com.pata.keja.dto.student.StudentRegistrationRequest;
import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Public authentication and registration flows — /register and /login in the frontend. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        authService.requestPasswordReset(email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/validate-hostel-code")
    public HostelCodeValidationResponse validateHostelCode(@RequestParam String code) {
        return authService.validateHostelCode(code);
    }

    @PostMapping("/register/student")
    public ResponseEntity<StudentResponse> registerStudent(
            @Valid @RequestBody StudentRegistrationRequest request) {
        StudentResponse response = authService.registerStudent(request);
        return ResponseEntity.created(URI.create("/api/students/" + response.id())).body(response);
    }
}
