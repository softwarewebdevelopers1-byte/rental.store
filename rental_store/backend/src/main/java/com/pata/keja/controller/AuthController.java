package com.pata.keja.controller;

import java.net.URI;

import jakarta.validation.Valid;

import com.pata.keja.dto.student.StudentRegistrationRequest;
import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.service.impl.StudentRegistrationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public authentication and registration flows — /register and /login in the frontend. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final StudentRegistrationService registrationService;

    public AuthController(StudentRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/register/student")
    public ResponseEntity<StudentResponse> registerStudent(
            @Valid @RequestBody StudentRegistrationRequest request) {
        StudentResponse response = registrationService.register(request);
        return ResponseEntity.created(URI.create("/api/students/" + response.id())).body(response);
    }
}
