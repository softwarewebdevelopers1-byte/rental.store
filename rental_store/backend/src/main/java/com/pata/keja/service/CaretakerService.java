package com.pata.keja.service;

import java.util.List;

import com.pata.keja.dto.caretaker.CaretakerResponse;
import com.pata.keja.dto.caretaker.CaretakerStatsResponse;
import com.pata.keja.dto.caretaker.CaretakerSummaryResponse;
import com.pata.keja.dto.hostel.HostelSummaryResponse;
import com.pata.keja.dto.student.StudentSummaryResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CaretakerService {

    CaretakerResponse getCurrent();

    List<HostelSummaryResponse> listAssignedHostels();

    Page<StudentSummaryResponse> listTenants(Pageable pageable);

    Page<CaretakerSummaryResponse> list(Pageable pageable);

    CaretakerStatsResponse stats();
}
