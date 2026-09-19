package com.pata.keja.controller;

import jakarta.validation.Valid;

import com.pata.keja.dto.student.ChangeHostelRequest;
import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.dto.student.StudentRoleFilter;
import com.pata.keja.dto.student.StudentSummaryResponse;
import com.pata.keja.dto.student.StudentUpdateRequest;
import com.pata.keja.service.StudentService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Student profile and administration — student account and admin user screens. */
@RestController
@RequestMapping("/api/students")
@PreAuthorize("isAuthenticated()")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentResponse getCurrent() {
        return studentService.getCurrent();
    }

    @PatchMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentResponse updateCurrent(@Valid @RequestBody StudentUpdateRequest request) {
        return studentService.updateCurrent(request);
    }

    @PostMapping("/me/change-hostel")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentResponse changeHostel(@Valid @RequestBody ChangeHostelRequest request) {
        return studentService.changeHostel(request);
    }

    @DeleteMapping("/me/hostel-request")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentResponse cancelHostelRequest() {
        return studentService.cancelHostelRequest();
    }

    @GetMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    public StudentResponse getById(@PathVariable String id) {
        return studentService.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<StudentSummaryResponse> list(
            @ModelAttribute StudentRoleFilter filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return studentService.list(filter, pageable);
    }
}
