package com.pata.keja.service;

import com.pata.keja.dto.booking.BookingResponse;
import com.pata.keja.dto.booking.CreateBookingRequest;
import com.pata.keja.dto.booking.RejectBookingRequest;
import com.pata.keja.enums.BookingRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookingService {

    BookingResponse create(CreateBookingRequest request);

    List<BookingResponse> listMyBookings();

    BookingResponse cancel(String bookingId);

    Page<BookingResponse> listForCurrentLandlord(BookingRequestStatus status, Pageable pageable);

    Page<BookingResponse> listForCurrentCaretaker(BookingRequestStatus status, Pageable pageable);

    BookingResponse approve(String bookingId);

    BookingResponse reject(String bookingId, RejectBookingRequest request);
}
