package com.pata.keja.service.impl;

import com.pata.keja.enums.ConversationSubject;
import com.pata.keja.enums.MaintenanceStatus;
import com.pata.keja.dto.maintenance.*;
import com.pata.keja.dto.messaging.StartConversationRequest;
import com.pata.keja.models.*;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.MaintenanceMapper;
import com.pata.keja.repository.*;
import com.pata.keja.service.MaintenanceService;
import com.pata.keja.service.MessageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepo;
    private final StudentRepository studentRepo;
    private final HostelRepository hostelRepo;
    private final RoomRepository roomRepo;
    private final CaretakerRepository caretakerRepo;
    private final MaintenanceMapper maintenanceMapper;
    private final MessageService messageService;

    public MaintenanceServiceImpl(MaintenanceRepository maintenanceRepo,
            StudentRepository studentRepo,
            HostelRepository hostelRepo,
            RoomRepository roomRepo,
            CaretakerRepository caretakerRepo,
            MaintenanceMapper maintenanceMapper,
            MessageService messageService) {
        this.maintenanceRepo = maintenanceRepo;
        this.studentRepo = studentRepo;
        this.hostelRepo = hostelRepo;
        this.roomRepo = roomRepo;
        this.caretakerRepo = caretakerRepo;
        this.maintenanceMapper = maintenanceMapper;
        this.messageService = messageService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceSummaryResponse> listForStudent(String studentId) {
        return maintenanceRepo.findAllForStudent(studentId).stream()
                .map(maintenanceMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceSummaryResponse> listForHostels(List<String> hostelIds, MaintenanceStatus filter) {
        return maintenanceRepo.findAllForHostelsFiltered(hostelIds, filter).stream()
                .map(maintenanceMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MaintenanceResponse getById(String id) {
        MaintenanceRequest m = maintenanceRepo.findByIdWithAssociations(id)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found"));
        return maintenanceMapper.toResponse(m);
    }

    @Override
    public MaintenanceResponse create(String studentId, MaintenanceCreateRequest req) {
        Student student = studentRepo.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (student.getHostel() == null) {
            throw new ConflictException("Student is not in a hostel");
        }

        MaintenanceRequest m = new MaintenanceRequest();
        m.setStudent(student);
        m.setHostel(student.getHostel());
        m.setRoom(student.getRoom());
        m.setTitle(req.title());
        m.setDescription(req.description());
        m.setCategory(req.category());
        m.setStatus(MaintenanceStatus.OPEN);
        if (req.attachments() != null) {
            m.setAttachments(new ArrayList<>(req.attachments()));
        }
        maintenanceRepo.save(m);

        // Create a conversation between student and the hostel's caretakers
        List<String> participants = new ArrayList<>();
        participants.add(studentId);
        caretakerRepo.findAllByAssignedHostel(student.getHostel().getId())
                .forEach(c -> participants.add(c.getId()));

        var conversation = messageService.startConversation(
                studentId,
                new StartConversationRequest(
                        participants.subList(1, participants.size()),
                        ConversationSubject.MAINTENANCE,
                        req.title()));

        // Reload entity to attach the conversation id
        m.setConversation(
                new Conversation() {
                    {
                        setId(conversation.id());
                    }
                });

        return maintenanceMapper.toResponse(m);
    }

    @Override
    public MaintenanceResponse updateStatus(String id, MaintenanceStatus status) {
        MaintenanceRequest m = maintenanceRepo.findByIdWithAssociations(id)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found"));

        m.setStatus(status);
        if (status == MaintenanceStatus.RESOLVED) {
            m.setResolvedAt(Instant.now());
        }
        return maintenanceMapper.toResponse(m);
    }
}
