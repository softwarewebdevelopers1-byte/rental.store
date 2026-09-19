package com.pata.keja.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import com.pata.keja.dto.room.RoomCreateRequest;
import com.pata.keja.dto.room.RoomResponse;
import com.pata.keja.dto.room.RoomStatusUpdateRequest;
import com.pata.keja.dto.room.RoomSummaryResponse;
import com.pata.keja.dto.room.RoomUpdateRequest;
import com.pata.keja.service.RoomService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

/** Public room browsing and landlord management — the hostel room selection and management screens. */
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/hostel/{hostelId}")
    public List<RoomSummaryResponse> listForHostel(@PathVariable String hostelId) {
        return roomService.listForHostel(hostelId);
    }

    @GetMapping("/hostel/{hostelId}/vacant")
    public List<RoomSummaryResponse> listVacant(@PathVariable String hostelId) {
        return roomService.listVacant(hostelId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public RoomResponse getById(@PathVariable("id") String id) {
        return roomService.getById(id);
    }

    @PostMapping("/hostel/{hostelId}")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<RoomResponse> create(
            @PathVariable String hostelId,
            @Valid @RequestBody RoomCreateRequest request) {
        RoomResponse response = roomService.create(hostelId, request);
        return ResponseEntity.created(URI.create("/api/rooms/" + response.id())).body(response);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('LANDLORD')")
    public RoomResponse update(
            @PathVariable("id") String id,
            @Valid @RequestBody RoomUpdateRequest request) {
        return roomService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('LANDLORD')")
    public RoomResponse setStatus(
            @PathVariable("id") String id,
            @Valid @RequestBody RoomStatusUpdateRequest request) {
        return roomService.setStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
