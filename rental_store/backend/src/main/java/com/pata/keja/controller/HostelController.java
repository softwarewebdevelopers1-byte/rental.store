package com.pata.keja.controller;

import java.util.List;

import jakarta.validation.Valid;

import com.pata.keja.dto.hostel.CaretakerAssignmentRequest;
import com.pata.keja.dto.hostel.AcceptStudentRequest;
import com.pata.keja.dto.hostel.HostelCreateRequest;
import com.pata.keja.dto.hostel.HostelFilter;
import com.pata.keja.dto.hostel.HostelResponse;
import com.pata.keja.dto.hostel.HostelSummaryResponse;
import com.pata.keja.dto.hostel.HostelUpdateRequest;
import com.pata.keja.dto.hostel.PendingStudentRequestResponse;
import com.pata.keja.dto.room.RoomSummaryResponse;
import com.pata.keja.dto.student.StudentSummaryResponse;
import com.pata.keja.service.HostelService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
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

/** Hostel discovery and management — public search and landlord property screens. */
@RestController
@RequestMapping("/api/hostels")
public class HostelController {

    private final HostelService hostelService;

    public HostelController(HostelService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping
    public Page<HostelSummaryResponse> search(
            @ModelAttribute HostelFilter filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return hostelService.search(filter, pageable);
    }

    @GetMapping("/{id}")
    public HostelResponse getById(@PathVariable String id) {
        return hostelService.getById(id);
    }

    @GetMapping("/code/{code}")
    public HostelSummaryResponse getByCode(@PathVariable String code) {
        return hostelService.getByCode(code);
    }

    @GetMapping("/{id}/rooms")
    public List<RoomSummaryResponse> listRooms(@PathVariable String id) {
        return hostelService.listRooms(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('LANDLORD')")
    public HostelResponse create(@Valid @RequestBody HostelCreateRequest request) {
        return hostelService.create(request);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public HostelResponse update(
            @PathVariable String id,
            @Valid @RequestBody HostelUpdateRequest request) {
        return hostelService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        hostelService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('LANDLORD')")
    public Page<HostelSummaryResponse> listByCurrentLandlord(
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return hostelService.listByCurrentLandlord(pageable);
    }

    @GetMapping("/{id}/tenants")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public Page<StudentSummaryResponse> listTenants(
            @PathVariable String id,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return hostelService.listTenants(id, pageable);
    }

    @GetMapping("/{id}/pending-requests")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public List<PendingStudentRequestResponse> listPendingRequests(@PathVariable String id) {
        return hostelService.listPendingRequests(id);
    }

    @PostMapping("/{id}/requests/{studentId}/accept")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public ResponseEntity<Void> acceptRequest(
            @PathVariable String id,
            @PathVariable String studentId,
            @Valid @RequestBody AcceptStudentRequest request) {
        hostelService.acceptRequest(id, studentId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/requests/{studentId}/reject")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public ResponseEntity<Void> rejectRequest(
            @PathVariable String id,
            @PathVariable String studentId) {
        hostelService.rejectRequest(id, studentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/caretakers")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public ResponseEntity<Void> assignCaretaker(
            @PathVariable String id,
            @Valid @RequestBody CaretakerAssignmentRequest request) {
        hostelService.assignCaretaker(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/caretakers/{caretakerId}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public ResponseEntity<Void> removeCaretaker(
            @PathVariable String id,
            @PathVariable String caretakerId) {
        hostelService.removeCaretaker(id, caretakerId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/tenants/{studentId}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    public ResponseEntity<Void> removeTenant(
            @PathVariable String id,
            @PathVariable String studentId) {
        hostelService.removeTenant(id, studentId);
        return ResponseEntity.noContent().build();
    }
}
