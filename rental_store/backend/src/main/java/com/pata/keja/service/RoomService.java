package com.pata.keja.service;

import com.pata.keja.dto.room.RoomCreateRequest;
import com.pata.keja.dto.room.RoomResponse;
import com.pata.keja.dto.room.RoomSummaryResponse;
import com.pata.keja.dto.room.RoomUpdateRequest;
import com.pata.keja.enums.RoomStatus;

import java.util.List;

public interface RoomService {

    List<RoomSummaryResponse> listForHostel(String hostelId);

    RoomResponse getById(String roomId);

    RoomResponse create(String hostelId, RoomCreateRequest req);

    RoomResponse update(String roomId, RoomUpdateRequest req);

    RoomResponse setStatus(String roomId, RoomStatus status);

    void delete(String roomId);
}
