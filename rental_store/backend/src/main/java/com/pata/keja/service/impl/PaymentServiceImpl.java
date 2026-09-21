package com.pata.keja.service.impl;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pata.keja.dto.payment.PaymentCreateRequest;
import com.pata.keja.dto.payment.PaymentBatchRecordRequest;
import com.pata.keja.dto.payment.PaymentHistoryFilter;
import com.pata.keja.dto.payment.PaymentRecordItem;
import com.pata.keja.dto.payment.PaymentRecordRequest;
import com.pata.keja.dto.payment.HostelPaymentBreakdown;
import com.pata.keja.dto.payment.LandlordPaymentSummaryResponse;
import com.pata.keja.dto.payment.PaymentReminderRequest;
import com.pata.keja.dto.payment.PaymentResponse;
import com.pata.keja.dto.payment.LandlordPaymentStatsResponse;
import com.pata.keja.dto.payment.PaymentSummaryResponse;
import com.pata.keja.dto.payment.StudentPaymentSummaryResponse;
import com.pata.keja.dto.hostel.CaretakerPaymentPermissionRequest;
import com.pata.keja.dto.hostel.HostelPaymentRecorderResponse;
import com.pata.keja.dto.hostel.RecorderSummary;
import com.pata.keja.enums.PaymentMethod;
import com.pata.keja.enums.PaymentStatus;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.exception.AccessDeniedException;
import com.pata.keja.mapper.PaymentMapper;
import com.pata.keja.models.Caretaker;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Payment;
import com.pata.keja.models.Student;
import com.pata.keja.models.User;
import com.pata.keja.repository.CaretakerRepository;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.PaymentRepository;
import com.pata.keja.repository.RoomRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.repository.UserRepository;
import com.pata.keja.service.NotificationService;
import com.pata.keja.service.PaymentService;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final StudentRepository studentRepo;
    private final HostelRepository hostelRepo;
    private final RoomRepository roomRepo;
    private final CaretakerRepository caretakerRepo;
    private final UserRepository userRepo;
    private final PaymentMapper paymentMapper;
    private final NotificationService notificationService; // your next slice

    public PaymentServiceImpl(PaymentRepository paymentRepo,
            StudentRepository studentRepo,
            HostelRepository hostelRepo,
            RoomRepository roomRepo,
            CaretakerRepository caretakerRepo,
            UserRepository userRepo,
            PaymentMapper paymentMapper,
            NotificationService notificationService) {
        this.paymentRepo = paymentRepo;
        this.studentRepo = studentRepo;
        this.hostelRepo = hostelRepo;
        this.roomRepo = roomRepo;
        this.caretakerRepo = caretakerRepo;
        this.userRepo = userRepo;
        this.paymentMapper = paymentMapper;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentPaymentSummaryResponse summaryForStudent(String studentId) {
        Student student = studentRepo.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        long currentRent = student.getRoom() != null
                ? student.getRoom().getPrice()
                : 0L;

        List<Payment> history = paymentRepo.findAllByStudentWithAssociations(studentId);

        return paymentMapper.toStudentSummary(currentRent, history);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentSummaryResponse> listForStudent(String studentId, Pageable pageable) {
        return paymentRepo.findAllByStudentId(studentId, pageable).map(paymentMapper::toSummary);
    }

    @Override
    public PaymentResponse recordPayment(String studentId, PaymentCreateRequest req) {
        Student student = studentRepo.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (student.getHostel() == null) {
            throw new ConflictException("Student is not in a hostel");
        }

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setHostel(student.getHostel());
        payment.setRoom(student.getRoom());
        payment.setAmount(req.amount());
        payment.setDueDate(req.dueDate());
        payment.setStatus(PaymentStatus.PAID); // mock: recording a payment marks it paid
        payment.setPaidAt(Instant.now());
        payment.setMethod(req.method());
        payment.setReference(req.reference());
        payment.setNotes(req.notes());

        paymentRepo.save(payment);
        return paymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponse markPaid(String paymentId,
            PaymentMethodInput method,
            String reference) {
        Payment payment = paymentRepo.findByIdWithAssociations(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        if (method != null && method.method() != null) {
            payment.setMethod(PaymentMethod.valueOf(method.method()));
        }
        payment.setReference(reference);
        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentSummaryResponse> listForHostel(String hostelId,
            PaymentStatusFilter filter,
            Pageable pageable) {
        if (filter == null || filter == PaymentStatusFilter.ALL) {
            return paymentRepo.findAllByHostelId(hostelId, pageable)
                    .map(paymentMapper::toSummary);
        }
        PaymentStatus status = switch (filter) {
            case PAID -> PaymentStatus.PAID;
            case PENDING -> PaymentStatus.PENDING;
            case OVERDUE -> PaymentStatus.OVERDUE;
            case ALL -> null;
        };
        return paymentRepo.findAllByHostelIdAndStatus(hostelId, status, pageable)
                .map(paymentMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordPaymentStatsResponse statsForHostel(String hostelId) {
        long paid = paymentRepo.countByHostelIdAndStatus(hostelId, PaymentStatus.PAID);
        long pending = paymentRepo.countByHostelIdAndStatus(hostelId, PaymentStatus.PENDING);
        long overdue = paymentRepo.countByHostelIdAndStatus(hostelId, PaymentStatus.OVERDUE);
        long collected = paymentRepo.sumByHostelAndStatus(hostelId, PaymentStatus.PAID);
        long outstanding = paymentRepo.sumByHostelAndStatus(hostelId, PaymentStatus.PENDING)
                + paymentRepo.sumByHostelAndStatus(hostelId, PaymentStatus.OVERDUE);
        return new LandlordPaymentStatsResponse(paid, pending, overdue, collected, outstanding);
    }

    @Override
    public void sendReminders(String landlordId, PaymentCreateRequest req) {
        // Validate that the landlord owns all the students' hostels…
        // Then emit notifications (next slice) — for now, just log.
    }

    @Override
    public void sendReminders(String landlordId, PaymentReminderRequest req) {
        // Validate that the landlord owns all the students' hostels…
        // Then emit notifications (next slice) — for now, just log.
        req.studentIds().forEach(id -> {
            // notificationService.notify(id, NotificationKind.PAYMENT_DUE, ...);
        });
    }

    @Override
    public PaymentResponse recordForLandlord(String landlordId, PaymentRecordRequest request) {
        User landlord = userRepo.findById(landlordId)
                .orElseThrow(() -> new NotFoundException("Landlord not found"));
        Student student = studentRepo.findWithAssociationsById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Student not found"));
        Hostel hostel = requireStudentHostel(student);
        assertLandlordOwns(landlordId, hostel);
        return saveRecordedPayment(landlord, student, request);
    }

    @Override
    public PaymentResponse recordForCaretaker(String caretakerId, PaymentRecordRequest request) {
        Caretaker caretaker = caretakerRepo.findByIdWithHostels(caretakerId)
                .orElseThrow(() -> new NotFoundException("Caretaker not found"));
        Student student = studentRepo.findWithAssociationsById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Student not found"));
        Hostel studentHostel = requireStudentHostel(student);
        boolean assigned = caretaker.getAssignedHostels().stream()
                .anyMatch(hostel -> hostel.getId().equals(studentHostel.getId()));
        if (!assigned) {
            throw new AccessDeniedException("You are not assigned to this hostel.");
        }
        Hostel hostel = hostelRepo.findByIdWithPaymentRecorderDetails(studentHostel.getId())
                .orElseThrow(() -> new NotFoundException("Hostel not found"));
        if (!hostel.canRecordPayments(caretakerId)) {
            throw new AccessDeniedException(
                    "You do not have permission to record payments for this hostel.");
        }
        return saveRecordedPayment(caretaker, student, request);
    }

    @Override
    public List<PaymentSummaryResponse> recordBatch(
            String landlordId, PaymentBatchRecordRequest request) {
        User landlord = userRepo.findById(landlordId)
                .orElseThrow(() -> new NotFoundException("Landlord not found"));
        Set<String> ids = request.payments().stream().map(PaymentRecordItem::studentId).collect(java.util.stream.Collectors.toSet());
        List<Student> students = studentRepo.findAllByIdIn(ids);
        Map<String, Student> byId = students.stream().collect(java.util.stream.Collectors.toMap(Student::getId, s -> s));
        Set<String> landlordHostelIds = new HashSet<>(hostelRepo.findActiveIdsByLandlordId(landlordId));
        List<String> offending = ids.stream()
                .filter(id -> !byId.containsKey(id)
                        || byId.get(id).getHostel() == null
                        || !landlordHostelIds.contains(byId.get(id).getHostel().getId()))
                .sorted()
                .toList();
        if (!offending.isEmpty()) {
            throw new ConflictException("Students are outside your hostels: " + String.join(", ", offending));
        }
        List<Payment> payments = request.payments().stream().map(item -> {
            Student student = byId.get(item.studentId());
            Payment payment = new Payment();
            payment.setStudent(student);
            payment.setHostel(student.getHostel());
            payment.setRoom(student.getRoom());
            payment.setAmount(item.amount());
            payment.setDueDate(item.dueDate());
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(Instant.now());
            payment.setMethod(item.method());
            payment.setReference(item.reference());
            payment.setPeriodLabel(request.periodLabel());
            payment.setRecordedBy(landlord);
            return payment;
        }).toList();
        paymentRepo.saveAll(payments);
        return payments.stream().map(paymentMapper::toSummary).toList();
    }

    /**
     * Date ranges use paidAt for PAID records and dueDate for all other
     * statuses. Paid instants are converted using Africa/Nairobi so a date
     * represents the complete Nairobi calendar day.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PaymentSummaryResponse> searchForLandlord(
            String landlordId, PaymentHistoryFilter filter, Pageable pageable) {
        return search(hostelRepo.findActiveIdsByLandlordId(landlordId), filter, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentSummaryResponse> searchForCaretaker(
            String caretakerId, PaymentHistoryFilter filter, Pageable pageable) {
        Caretaker caretaker = caretakerRepo.findByIdWithHostels(caretakerId)
                .orElseThrow(() -> new NotFoundException("Caretaker not found"));
        return search(caretaker.getAssignedHostels().stream().map(Hostel::getId).toList(), filter, pageable);
    }

    private Page<PaymentSummaryResponse> search(
            Collection<String> hostelIds, PaymentHistoryFilter filter, Pageable pageable) {
        if (hostelIds.isEmpty()) {
            return Page.empty(pageable);
        }
        PaymentHistoryFilter f = filter == null
                ? new PaymentHistoryFilter(null, null, null, null, null, null, null, null, null, null, null, null)
                : filter;
        boolean dateOnPaid = f.status() == PaymentStatus.PAID;
        ZoneId zone = ZoneId.of("Africa/Nairobi");
        Instant from = f.fromDate() == null ? null : f.fromDate().atStartOfDay(zone).toInstant();
        Instant toExclusive = f.toDate() == null
                ? null
                : f.toDate().plusDays(1).atStartOfDay(zone).toInstant();
        return paymentRepo.searchForHostels(
                hostelIds, f.studentId(), f.hostelId(), f.roomId(), f.minAmount(), f.maxAmount(),
                f.status(), f.method(), f.periodLabel(), f.reference(), f.studentQuery(),
                f.fromDate(), f.toDate(), from, toExclusive, dateOnPaid, pageable)
                .map(paymentMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordPaymentSummaryResponse summaryForLandlord(String landlordId) {
        return buildSummary(hostelRepo.findActiveIdsByLandlordId(landlordId));
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordPaymentSummaryResponse summaryForCaretaker(String caretakerId) {
        Caretaker caretaker = caretakerRepo.findByIdWithHostels(caretakerId)
                .orElseThrow(() -> new NotFoundException("Caretaker not found"));
        return buildSummary(caretaker.getAssignedHostels().stream().map(Hostel::getId).toList());
    }

    private LandlordPaymentSummaryResponse buildSummary(Collection<String> hostelIds) {
        if (hostelIds.isEmpty()) {
            return new LandlordPaymentSummaryResponse(0, 0, 0, 0, 0, List.of());
        }
        YearMonth month = YearMonth.now(ZoneId.of("Africa/Nairobi"));
        Instant start = month.atDay(1).atStartOfDay(ZoneId.of("Africa/Nairobi")).toInstant();
        Instant end = month.plusMonths(1).atDay(1).atStartOfDay(ZoneId.of("Africa/Nairobi")).toInstant();
        Map<String, long[]> counts = new HashMap<>();
        long collected = 0;
        for (Object[] row : paymentRepo.aggregateByHostelAndStatus(hostelIds, start, end)) {
            String hostelId = (String) row[0];
            PaymentStatus status = (PaymentStatus) row[1];
            long[] values = counts.computeIfAbsent(hostelId, ignored -> new long[4]);
            values[status == PaymentStatus.PAID ? 0 : status == PaymentStatus.PENDING ? 1 : 2] = ((Number) row[2]).longValue();
            values[3] += ((Number) row[4]).longValue();
            collected += ((Number) row[4]).longValue();
        }
        Map<String, Hostel> hostels = hostelRepo.findAllByIdIn(hostelIds).stream()
                .collect(java.util.stream.Collectors.toMap(Hostel::getId, h -> h));
        long paid = 0, pending = 0, overdue = 0, outstanding = 0;
        List<HostelPaymentBreakdown> breakdown = new java.util.ArrayList<>();
        for (String id : hostelIds) {
            long[] values = counts.getOrDefault(id, new long[4]);
            paid += values[0];
            pending += values[1];
            overdue += values[2];
            outstanding += values[1] + values[2];
            Hostel hostel = hostels.get(id);
            if (hostel != null) {
                breakdown.add(new HostelPaymentBreakdown(id, hostel.getName(), values[0], values[1], values[2], values[3]));
            }
        }
        return new LandlordPaymentSummaryResponse(paid, pending, overdue, collected, outstanding, breakdown);
    }

    @Override
    public HostelPaymentRecorderResponse listPaymentRecorders(String landlordId, String hostelId) {
        Hostel hostel = requireOwnedHostel(landlordId, hostelId);
        Set<String> permittedIds = hostel.getPaymentRecorderCaretakerIds();
        List<Caretaker> assigned = hostel.getCaretakers().stream().toList();
        Map<String, User> users = userRepo.findAllById(permittedIds).stream()
                .collect(java.util.stream.Collectors.toMap(User::getId, u -> u));
        List<RecorderSummary> permitted = assigned.stream()
                .filter(c -> permittedIds.contains(c.getId()))
                .map(c -> new RecorderSummary(c.getId(), c.getName(), c.getEmail()))
                .toList();
        List<RecorderSummary> notPermitted = assigned.stream()
                .filter(c -> !permittedIds.contains(c.getId()))
                .map(c -> new RecorderSummary(c.getId(), c.getName(), c.getEmail()))
                .toList();
        return new HostelPaymentRecorderResponse(hostelId, permitted, notPermitted);
    }

    @Override
    public HostelPaymentRecorderResponse setPaymentRecorder(
            String landlordId, String hostelId, CaretakerPaymentPermissionRequest request) {
        Hostel hostel = requireOwnedHostel(landlordId, hostelId);
        boolean assigned = hostel.getCaretakers().stream()
                .anyMatch(c -> c.getId().equals(request.caretakerId()));
        if (!assigned) {
            throw new ConflictException("Caretaker is not assigned to this hostel.");
        }
        if (request.allowed()) {
            hostel.getPaymentRecorderCaretakerIds().add(request.caretakerId());
        } else {
            hostel.getPaymentRecorderCaretakerIds().remove(request.caretakerId());
        }
        hostelRepo.save(hostel);
        return listPaymentRecorders(landlordId, hostelId);
    }

    private PaymentResponse saveRecordedPayment(User recorder, Student student, PaymentRecordRequest request) {
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setHostel(student.getHostel());
        payment.setRoom(student.getRoom());
        payment.setAmount(request.amount());
        payment.setDueDate(request.dueDate());
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        payment.setMethod(request.method());
        payment.setReference(request.reference());
        payment.setNotes(request.notes());
        payment.setPeriodLabel(request.periodLabel());
        payment.setRecordedBy(recorder);
        return paymentMapper.toResponse(paymentRepo.save(payment));
    }

    private Hostel requireStudentHostel(Student student) {
        if (student.getHostel() == null) {
            throw new ConflictException("Student is not in a hostel");
        }
        return student.getHostel();
    }

    private void assertLandlordOwns(String landlordId, Hostel hostel) {
        if (hostel.getLandlord() == null || !landlordId.equals(hostel.getLandlord().getId())) {
            throw new AccessDeniedException("You do not own this student's hostel.");
        }
    }

    private Hostel requireOwnedHostel(String landlordId, String hostelId) {
        Hostel hostel = hostelRepo.findByIdWithPaymentRecorderDetails(hostelId)
                .orElseThrow(() -> new NotFoundException("Hostel not found"));
        assertLandlordOwns(landlordId, hostel);
        return hostel;
    }
}
