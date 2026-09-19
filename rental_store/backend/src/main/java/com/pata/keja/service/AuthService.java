package com.pata.keja.service;

import com.pata.keja.dto.auth.HostelCodeValidationResponse;
import com.pata.keja.dto.auth.LoginRequest;
import com.pata.keja.dto.auth.LoginResponse;
import com.pata.keja.dto.student.StudentRegistrationRequest;
import com.pata.keja.dto.student.StudentResponse;

public interface AuthService {

    LoginResponse login(LoginRequest req);

    void requestPasswordReset(String email);

    HostelCodeValidationResponse validateHostelCode(String code);

    StudentResponse registerStudent(StudentRegistrationRequest req);
}
