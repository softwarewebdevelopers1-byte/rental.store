package com.pata.keja.mapper;

import org.springframework.stereotype.Component;
import com.pata.keja.dto.hostel.HostelResponse;
import com.pata.keja.dto.hostel.HostelSummaryResponse;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.enums.BillingPeriod;
import com.pata.keja.enums.VerificationStatus;
import com.pata.keja.models.Caretaker;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Room;

import java.util.Comparator;
import java.util.List;

@Component
public class HostelMapper {

    public HostelSummaryResponse toSummary(Hostel h) {
        List<Room> rooms = h.getRooms();
        long vacant = rooms.stream().filter(r -> r.getStatus() == RoomStatus.VACANT).count();
        Long min = rooms.stream().map(Room::getPrice).min(Long::compareTo).orElse(null);
        Long max = rooms.stream().map(Room::getPrice).max(Long::compareTo).orElse(null);
        BillingPeriod billingPeriod = rooms.stream().map(Room::getBillingPeriod).distinct().count() == 1
                ? rooms.get(0).getBillingPeriod()
                : null;
        String mainImage = h.getImages().isEmpty() ? null : h.getImages().get(0);

        return new HostelSummaryResponse(
                h.getId(),
                h.getName(),
                h.getCode(),
                h.getLocation(),
                mainImage,
                h.getRating(),
                h.getReviewCount(),
                (int) vacant,
                rooms.size(),
                min,
                max,
                billingPeriod,
                h.getLandlord().getVerificationStatus() == VerificationStatus.APPROVED,
                h.getLandlord().getId(),
                h.getLandlord().getName(),
                h.isActive(),
                h.getCreatedAt());
    }

    public HostelResponse toResponse(com.pata.keja.models.Hostel h) {
        List<com.pata.keja.models.Room> rooms = h.getRooms();
        long vacant = rooms.stream().filter(r -> r.getStatus() == RoomStatus.VACANT).count();
        long booked = rooms.stream().filter(r -> r.getStatus() == RoomStatus.BOOKED).count();
        Long min = rooms.stream().map(Room::getPrice).min(Long::compareTo).orElse(null);
        Long max = rooms.stream().map(Room::getPrice).max(Long::compareTo).orElse(null);
        BillingPeriod billingPeriod = rooms.stream().map(Room::getBillingPeriod).distinct().count() == 1
                ? rooms.get(0).getBillingPeriod()
                : null;

        List<HostelResponse.RoomSummary> roomSummaries = rooms.stream()
                .sorted(Comparator.comparing(com.pata.keja.models.Room::getNumber))
                .map(r -> new HostelResponse.RoomSummary(
                        r.getId(),
                        r.getNumber(),
                        r.getPrice(),
                        r.getBillingPeriod(),
                        r.getStatus().name(),
                        null, // tenantId — filled by service when needed
                        null // tenantName
                ))
                .toList();

        List<HostelResponse.CaretakerSummary> caretakerSummaries = h.getCaretakers().stream()
                .sorted(Comparator.comparing(Caretaker::getName))
                .map(c -> new HostelResponse.CaretakerSummary(
                        c.getId(),
                        c.getName(),
                        c.getEmail()))
                .toList();

        return new HostelResponse(
                h.getId(),
                h.getName(),
                h.getCode(),
                h.getLocation(),
                h.getDescription(),
                List.copyOf(h.getImages()),
                h.getRating(),
                h.getReviewCount(),
                h.isActive(),

                h.getLandlord().getId(),
                h.getLandlord().getName(),
                h.getLandlord().getVerificationStatus() == VerificationStatus.APPROVED,

                rooms.size(),
                (int) vacant,
                (int) booked,
                min,
                max,
                billingPeriod,

                roomSummaries,
                caretakerSummaries,

                h.getCreatedAt(),
                h.getUpdatedAt());
    }
}
