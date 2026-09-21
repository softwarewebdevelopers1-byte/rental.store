package com.pata.keja.service.impl;

import java.time.Instant;
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
import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.exception.AccessDeniedException;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.HostelMapper;
import com.pata.keja.mapper.RoomMapper;
import com.pata.keja.mapper.StudentMapper;
import com.pata.keja.models.Caretaker;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Student;
import com.pata.keja.repository.CaretakerRepository;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.LandlordRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.security.CurrentUserProvider;
import com.pata.keja.service.HostelService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class HostelServiceImpl implements HostelService {

    private final HostelRepository hostelRepository;
    private final LandlordRepository landlordRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final CaretakerRepository caretakerRepository;
    private final HostelMapper hostelMapper;
    private final RoomMapper roomMapper;
    private final StudentMapper studentMapper;

    public HostelServiceImpl(HostelRepository hostelRepository,
            LandlordRepository landlordRepository,
            StudentRepository studentRepository,
            RoomRepository roomRepository,
            CaretakerRepository caretakerRepository,
            HostelMapper hostelMapper,
            RoomMapper roomMapper,
            StudentMapper studentMapper) {
        this.hostelRepository = hostelRepository;
        this.landlordRepository = landlordRepository;
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.caretakerRepository = caretakerRepository;
        this.hostelMapper = hostelMapper;
        this.roomMapper = roomMapper;
        this.studentMapper = studentMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HostelSummaryResponse> search(HostelFilter filter, Pageable pageable) {
        HostelFilter actual = filter == null ? new HostelFilter(null, null, null, null, null, null, null) : filter;
        return hostelRepository.searchFiltered(
                blankToNull(actual.q()),
                blankToNull(actual.location()),
                actual.minPrice(),
                actual.maxPrice(),
                actual.vacantOnly(),
                actual.minRating(),
                pageable).map(hostelMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public HostelResponse getById(String id) {
        return hostelMapper.toResponse(requireHostel(id));
    }

    @Override
    @Transactional(readOnly = true)
    public HostelSummaryResponse getByCode(String code) {
        Hostel hostel = hostelRepository.findByCodeIgnoreCase(code)
                .filter(Hostel::isActive)
                .orElseThrow(() -> new NotFoundException("Hostel not found"));
        return hostelMapper.toSummary(hostelRepository.findByIdWithDetails(hostel.getId())
                .orElseThrow(() -> new NotFoundException("Hostel not found")));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomSummaryResponse> listRooms(String hostelId) {
        if (!hostelRepository.existsById(hostelId)) {
            throw new NotFoundException("Hostel not found");
        }
        return roomRepository.findAllByHostelId(hostelId).stream().map(roomMapper::toSummary).toList();
    }

    @Override
    public HostelResponse create(HostelCreateRequest req) {
        String landlordId = CurrentUserProvider.requireUserId();
        if (hostelRepository.existsByCodeIgnoreCase(req.code())) {
            throw new ConflictException("Hostel code already exists");
        }
        com.pata.keja.models.Landlord landlord = findLandlord(landlordId);
        Hostel hostel = new Hostel();
        hostel.setLandlord(landlord);
        hostel.setName(req.name());
        hostel.setCode(req.code());
        hostel.setLocation(req.location());
        hostel.setDescription(req.description());
        if (req.images() != null) {
            hostel.setImages(req.images());
        }
        hostelRepository.save(hostel);
        return hostelMapper.toResponse(hostel);
    }

    @Override
    public HostelResponse update(String id, HostelUpdateRequest req) {
        Hostel hostel = requireOwnedOrAdmin(id);
        if (req.code() != null && !req.code().equalsIgnoreCase(hostel.getCode())
                && hostelRepository.existsByCodeIgnoreCaseAndIdNot(req.code(), id)) {
            throw new ConflictException("Hostel code already exists");
        }
        if (req.name() != null) hostel.setName(req.name());
        if (req.code() != null) hostel.setCode(req.code());
        if (req.location() != null) hostel.setLocation(req.location());
        if (req.description() != null) hostel.setDescription(req.description());
        if (req.images() != null) hostel.setImages(req.images());
        if (req.active() != null) hostel.setActive(req.active());
        return hostelMapper.toResponse(hostel);
    }

    @Override
    public void deactivate(String id) {
        requireOwnedOrAdmin(id).setActive(false);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HostelSummaryResponse> listByCurrentLandlord(Pageable pageable) {
        return hostelRepository.findAllByLandlordIdAndActiveTrue(CurrentUserProvider.requireUserId(), pageable)
                .map(hostelMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentSummaryResponse> listTenants(String hostelId, Pageable pageable) {
        requireOwnedOrAdmin(hostelId);
        return studentRepository.findAllByHostelIdAndMembershipStatus(hostelId, MembershipStatus.ACTIVE, pageable)
                .map(studentMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PendingStudentRequestResponse> listPendingRequests(String hostelId) {
        requireOwnedOrAdmin(hostelId);
        return studentRepository.findPendingRequestsForHostel(hostelId).stream()
                .map(student -> new PendingStudentRequestResponse(
                        student.getId(), student.getName(), student.getEmail(),
                        student.getRequestedHostel() != null ? student.getRequestedHostel().getId() : hostelId,
                        student.getRequestedHostel() != null ? student.getRequestedHostel().getName() : null,
                        student.getRequestedAt()))
                .toList();
    }

    @Override
    public void acceptRequest(String hostelId, String studentId) {
        Hostel hostel = requireOwnedOrAdmin(hostelId);
        Student student = studentRepository.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        if (student.getRequestedHostel() == null || !hostelId.equals(student.getRequestedHostel().getId())) {
            throw new ConflictException("Student has no pending request for this hostel");
        }
        var room = roomRepository.findByHostelAndStatusOrderByNumber(hostelId, RoomStatus.VACANT).stream()
                .findFirst().orElseThrow(() -> new ConflictException("No vacant rooms"));
        var previousRoom = student.getRoom();
        if (previousRoom != null && previousRoom != room) {
            previousRoom.setTenant(null);
            previousRoom.setStatus(RoomStatus.VACANT);
            student.setRoom(null);
            roomRepository.saveAndFlush(previousRoom);
        }
        student.setHostel(hostel);
        student.setRoom(room);
        student.setRequestedHostel(null);
        student.setMembershipStatus(MembershipStatus.ACTIVE);
        student.setActivatedAt(Instant.now());
        room.setTenant(student);
        room.setStatus(RoomStatus.BOOKED);
    }

    @Override
    public void rejectRequest(String hostelId, String studentId) {
        requireOwnedOrAdmin(hostelId);
        Student student = studentRepository.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        if (student.getRequestedHostel() == null || !hostelId.equals(student.getRequestedHostel().getId())) {
            throw new ConflictException("Student has no pending request for this hostel");
        }
        student.setRequestedHostel(null);
        student.setMembershipStatus(MembershipStatus.REJECTED);
    }

    @Override
    public void assignCaretaker(String hostelId, CaretakerAssignmentRequest req) {
        Hostel hostel = requireOwnedOrAdmin(hostelId);
        Caretaker caretaker = caretakerRepository.findByEmailIgnoreCase(req.caretakerEmail())
                .orElseThrow(() -> new NotFoundException("Caretaker not found"));
        caretaker.assign(hostel);
        caretakerRepository.save(caretaker);
    }

    private Hostel requireHostel(String id) {
        return hostelRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException("Hostel not found"));
    }

    private com.pata.keja.models.Landlord findLandlord(String id) {
        return landlordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Landlord not found"));
    }

    private Hostel requireOwnedOrAdmin(String id) {
        Hostel hostel = requireHostel(id);
        if (!CurrentUserProvider.isRole("ADMIN")
                && !hostel.getLandlord().getId().equals(CurrentUserProvider.requireUserId())) {
            throw new AccessDeniedException("You do not own this hostel");
        }
        return hostel;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
