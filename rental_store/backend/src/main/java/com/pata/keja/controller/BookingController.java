package com.pata.keja.controller;

import com.pata.keja.dto.booking.BookingResponse;
import com.pata.keja.dto.booking.CreateBookingRequest;
import com.pata.keja.dto.booking.RejectBookingRequest;
import com.pata.keja.enums.BookingRequestStatus;
import com.pata.keja.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static org.springframework.data.domain.Sort.Direction.DESC;

@RestController
@RequestMapping("/api")
@PreAuthorize("isAuthenticated()")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/bookings")
    @PreAuthorize("hasRole('STUDENT')")
    public BookingResponse create(@Valid @RequestBody CreateBookingRequest request) {
        return bookingService.create(request);
    }

    @GetMapping("/bookings/me")
    @PreAuthorize("hasRole('STUDENT')")
    public java.util.List<BookingResponse> listMyBookings() {
        return bookingService.listMyBookings();
    }

    @PostMapping("/bookings/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    public BookingResponse cancel(@PathVariable String id) {
        return bookingService.cancel(id);
    }

    @GetMapping("/landlords/me/bookings")
    @PreAuthorize("hasRole('LANDLORD')")
    public Page<BookingResponse> listLandlordBookings(
            @RequestParam(required = false) BookingRequestStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return bookingService.listForCurrentLandlord(status, pageable);
    }

    @GetMapping("/caretakers/me/bookings")
    @PreAuthorize("hasRole('CARETAKER')")
    public Page<BookingResponse> listCaretakerBookings(
            @RequestParam(required = false) BookingRequestStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return bookingService.listForCurrentCaretaker(status, pageable);
    }

    @PostMapping("/landlords/me/bookings/{id}/approve")
    @PreAuthorize("hasRole('LANDLORD')")
    public BookingResponse approve(@PathVariable String id) {
        return bookingService.approve(id);
    }

    @PostMapping("/landlords/me/bookings/{id}/reject")
    @PreAuthorize("hasRole('LANDLORD')")
    public BookingResponse reject(@PathVariable String id, @Valid @RequestBody RejectBookingRequest request) {
        return bookingService.reject(id, request);
    }
}
