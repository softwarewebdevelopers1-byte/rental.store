package com.pata.keja.service;

import java.util.List;

import com.pata.keja.dto.hostel.CaretakerAssignmentRequest;
import com.pata.keja.dto.hostel.HostelCreateRequest;
import com.pata.keja.dto.hostel.HostelFilter;
import com.pata.keja.dto.hostel.HostelResponse;
import com.pata.keja.dto.hostel.HostelSummaryResponse;
import com.pata.keja.dto.hostel.HostelUpdateRequest;
import com.pata.keja.dto.hostel.PendingStudentRequestResponse;
import com.pata.keja.dto.room.RoomSummaryResponse;
import com.pata.keja.dto.student.StudentSummaryResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface HostelService {

    Page<HostelSummaryResponse> search(HostelFilter filter, Pageable pageable);

    HostelResponse getById(String id);

    HostelSummaryResponse getByCode(String code);

    List<RoomSummaryResponse> listRooms(String hostelId);

    HostelResponse create(HostelCreateRequest req);

    HostelResponse update(String id, HostelUpdateRequest req);

    void deactivate(String id);

    Page<HostelSummaryResponse> listByCurrentLandlord(Pageable pageable);

    Page<StudentSummaryResponse> listTenants(String hostelId, Pageable pageable);

    List<PendingStudentRequestResponse> listPendingRequests(String hostelId);

    void acceptRequest(String hostelId, String studentId);

    void rejectRequest(String hostelId, String studentId);

    void assignCaretaker(String hostelId, CaretakerAssignmentRequest req);
}
