package com.pata.keja.service.impl;

import com.pata.keja.enums.ConflictStatus;
import com.pata.keja.enums.NotificationKind;
import com.pata.keja.enums.OrderStatus;
import com.pata.keja.dto.conflict.*;
import com.pata.keja.models.*;
import com.pata.keja.exception.AccessDeniedException;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.ConflictMapper;
import com.pata.keja.repository.*;
import com.pata.keja.service.ConflictService;
import com.pata.keja.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;

@Service
@Transactional
public class ConflictServiceImpl implements ConflictService {

    private final ConflictRepository conflictRepo;
    private final OrderRepository orderRepo;
    private final StudentRepository studentRepo;
    private final AdminRepository adminRepo;
    private final ConflictMapper conflictMapper;
    private final NotificationService notificationService;

    public ConflictServiceImpl(ConflictRepository conflictRepo,
            OrderRepository orderRepo,
            StudentRepository studentRepo,
            AdminRepository adminRepo,
            ConflictMapper conflictMapper,
            NotificationService notificationService) {
        this.conflictRepo = conflictRepo;
        this.orderRepo = orderRepo;
        this.studentRepo = studentRepo;
        this.adminRepo = adminRepo;
        this.conflictMapper = conflictMapper;
        this.notificationService = notificationService;
    }

    @Override
    public ConflictResponse create(String studentId, String orderId, ConflictCreateRequest req) {
        Order order = orderRepo.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!order.getStudent().getId().equals(studentId)) {
            throw new AccessDeniedException("Only the buying student can report a conflict");
        }
        if (conflictRepo.existsByOrderId(orderId)) {
            throw new ConflictException("A conflict has already been reported for this order");
        }
        if (order.getStatus() != OrderStatus.DELIVERED
                && order.getStatus() != OrderStatus.RECEIVED) {
            throw new ConflictException("Conflicts can only be reported after delivery");
        }

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        Conflict c = new Conflict();
        c.setOrder(order);
        c.setStudent(student);
        c.setAgent(order.getAgent());
        c.setIssue(req.issue());
        c.setDescription(req.description());
        c.setStatus(ConflictStatus.OPEN);
        if (req.attachments() != null) {
            c.setAttachments(new ArrayList<>(req.attachments()));
        }
        conflictRepo.save(c);

        // Move the order into CONFLICT state.
        order.setStatus(OrderStatus.CONFLICT);
        order.addTimelineEntry(OrderStatus.CONFLICT, "Conflict reported by student");

        notificationService.emit(
                order.getAgent().getId(),
                NotificationKind.ORDER,
                "Conflict reported",
                "Order #" + orderId.substring(0, 6) + " has an issue: " + req.issue().name(),
                "/agent/conflicts");
        return conflictMapper.toResponse(c);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConflictSummaryResponse> listForStudent(String studentId, Pageable pageable) {
        return conflictRepo.findAllByStudentId(studentId, pageable).map(conflictMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConflictSummaryResponse> listForAgent(String agentId, Pageable pageable) {
        return conflictRepo.findAllByAgentId(agentId, pageable).map(conflictMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConflictSummaryResponse> listAll(Pageable pageable) {
        return conflictRepo.findAll(pageable).map(conflictMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public ConflictResponse getById(String conflictId, String viewerId) {
        Conflict c = conflictRepo.findByIdWithDetails(conflictId)
                .orElseThrow(() -> new NotFoundException("Conflict not found"));

        boolean canView = c.getStudent().getId().equals(viewerId)
                || c.getAgent().getId().equals(viewerId)
                || c.getResolvedBy() != null && c.getResolvedBy().getId().equals(viewerId);
        // Admins pass the ID as viewerId; if you have role info, check that too.
        if (!canView) {
            // Permit admins by role — caller should pass an admin id.
            Admin admin = adminRepo.findById(viewerId).orElse(null);
            if (admin == null) {
                throw new AccessDeniedException("You do not have access to this conflict");
            }
        }
        return conflictMapper.toResponse(c);
    }

    @Override
    public ConflictResponse resolve(String conflictId, String adminId, ConflictResolveRequest req) {
        Conflict c = conflictRepo.findByIdWithDetails(conflictId)
                .orElseThrow(() -> new NotFoundException("Conflict not found"));

        if (c.getStatus() == ConflictStatus.RESOLVED || c.getStatus() == ConflictStatus.REJECTED) {
            throw new ConflictException("This conflict has already been resolved");
        }

        Admin admin = adminRepo.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        c.setStatus(req.decision());
        c.setResolution(req.resolution());
        c.setResolvedBy(admin);
        c.setResolvedAt(Instant.now());

        if (req.decision() == ConflictStatus.RESOLVED) {
            c.getOrder().setStatus(OrderStatus.RESOLVED);
            c.getOrder().addTimelineEntry(OrderStatus.RESOLVED, req.resolution());
        }

        notificationService.emit(
                c.getStudent().getId(),
                NotificationKind.ORDER,
                "Conflict " + req.decision().name().toLowerCase(),
                req.resolution(),
                "/student/orders/" + c.getOrder().getId());
        notificationService.emit(
                c.getAgent().getId(),
                NotificationKind.ORDER,
                "Conflict " + req.decision().name().toLowerCase(),
                req.resolution(),
                "/agent/conflicts");
        return conflictMapper.toResponse(c);
    }
}
