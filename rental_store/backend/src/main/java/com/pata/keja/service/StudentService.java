package com.pata.keja.service;

import com.pata.keja.dto.student.ChangeHostelRequest;
import com.pata.keja.dto.student.StudentResponse;
import com.pata.keja.dto.student.StudentRoleFilter;
import com.pata.keja.dto.student.StudentSummaryResponse;
import com.pata.keja.dto.student.StudentUpdateRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudentService {

    StudentResponse getCurrent();

    StudentResponse updateCurrent(StudentUpdateRequest req);

    StudentResponse changeHostel(ChangeHostelRequest req);

    StudentResponse cancelHostelRequest();

    StudentResponse getById(String id);

    Page<StudentSummaryResponse> list(StudentRoleFilter filter, Pageable pageable);
}
