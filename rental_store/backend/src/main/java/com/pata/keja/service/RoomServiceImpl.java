package com.pata.keja.service;

import com.pata.keja.enums.RoomStatus;
import com.pata.keja.dto.room.RoomCreateRequest;
import com.pata.keja.dto.room.RoomResponse;
import com.pata.keja.dto.room.RoomSummaryResponse;
import com.pata.keja.dto.room.RoomUpdateRequest;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Room;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.RoomMapper;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepo;
    private final HostelRepository hostelRepo;
    private final RoomMapper roomMapper;

    public RoomServiceImpl(RoomRepository roomRepo,
            HostelRepository hostelRepo,
            RoomMapper roomMapper) {
        this.roomRepo = roomRepo;
        this.hostelRepo = hostelRepo;
        this.roomMapper = roomMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomSummaryResponse> listForHostel(String hostelId) {
        if (!hostelRepo.existsById(hostelId)) {
            throw new NotFoundException("Hostel not found");
        }
        return roomRepo.findAllByHostelId(hostelId).stream()
                .map(roomMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomSummaryResponse> listVacant(String hostelId) {
        if (!hostelRepo.existsById(hostelId)) {
            throw new NotFoundException("Hostel not found");
        }
        return roomRepo.findVacantByHostel(hostelId).stream()
                .map(roomMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getById(String roomId) {
        Room room = roomRepo.findByIdWithAssociations(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found"));
        return roomMapper.toResponse(room);
    }

    @Override
    public RoomResponse create(String hostelId, RoomCreateRequest req) {
        if (roomRepo.existsByHostelIdAndNumber(hostelId, req.number())) {
            throw new ConflictException("Room number already exists in this hostel");
        }
        Hostel hostel = hostelRepo.findById(hostelId)
                .orElseThrow(() -> new NotFoundException("Hostel not found"));

        Room room = new Room();
        room.setHostel(hostel);
        room.setNumber(req.number());
        room.setPrice(req.price());
        room.setBillingPeriod(req.billingPeriod());
        room.setStatus(RoomStatus.VACANT);

        roomRepo.save(room);
        return roomMapper.toResponse(room);
    }

    @Override
    public RoomResponse update(String roomId, RoomUpdateRequest req) {
        Room room = roomRepo.findByIdWithAssociations(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found"));

        if (req.number() != null && !req.number().equals(room.getNumber())) {
            if (roomRepo.existsByHostelIdAndNumberAndIdNot(
                    room.getHostel().getId(), req.number(), roomId)) {
                throw new ConflictException("Room number already exists in this hostel");
            }
            room.setNumber(req.number());
        }
        if (req.price() != null) {
            room.setPrice(req.price());
        }
        if (req.billingPeriod() != null) {
            room.setBillingPeriod(req.billingPeriod());
        }
        return roomMapper.toResponse(room);
    }

    @Override
    public RoomResponse setStatus(String roomId, RoomStatus status) {
        Room room = roomRepo.findByIdWithAssociations(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found"));

        if (status == RoomStatus.VACANT && room.getTenant() != null) {
            throw new ConflictException("Room has an active tenant");
        }
        room.setStatus(status);
        return roomMapper.toResponse(room);
    }

    @Override
    public void delete(String roomId) {
        Room room = roomRepo.findByIdWithAssociations(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found"));

        if (room.getTenant() != null) {
            throw new ConflictException("Cannot delete a room with an active tenant");
        }
        roomRepo.delete(room);
    }
}
