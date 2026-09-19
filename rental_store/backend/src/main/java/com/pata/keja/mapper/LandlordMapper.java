package com.pata.keja.mapper;

import org.springframework.stereotype.Component;

import com.pata.keja.dto.hostel.HostelSummaryResponse;
import com.pata.keja.dto.landlord.LandlordResponse;
import com.pata.keja.dto.landlord.LandlordSummaryResponse;
import com.pata.keja.enums.RoomStatus;
import com.pata.keja.enums.VerificationStatus;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Landlord;
import com.pata.keja.models.Room;

import java.util.Comparator;
import java.util.List;

@Component
public class LandlordMapper {

    public LandlordSummaryResponse toSummary(Landlord l) {
        return new LandlordSummaryResponse(
                l.getId(),
                l.getName(),
                l.getEmail(),
                l.getPhone(),
                l.getAvatarUrl(),
                l.isActive(),
                l.getVerificationStatus(),
                l.getHostels().size(),
                l.getCreatedAt());
    }

    public LandlordResponse toResponse(Landlord l) {
        List<HostelSummaryResponse> hostelSummaries = l.getHostels().stream()
                .sorted(Comparator.comparing(Hostel::getCreatedAt))
                .map(this::toHostelSummary)
                .toList();

        return new LandlordResponse(
                l.getId(),
                l.getName(),
                l.getEmail(),
                l.getPhone(),
                l.getAvatarUrl(),
                l.getRole(),
                l.isActive(),
                l.getVerificationStatus(),
                l.getVerificationRequestedAt(),
                l.getVerificationDecidedAt(),
                l.getVerificationNotes(),
                hostelSummaries,
                l.getCreatedAt(),
                l.getUpdatedAt());
    }

    /** Lightweight hostel view used inside LandlordResponse. */
    private HostelSummaryResponse toHostelSummary(Hostel h) {
        List<Room> rooms = h.getRooms();
        long vacant = rooms.stream().filter(r -> r.getStatus() == RoomStatus.VACANT).count();
        Long min = rooms.stream().map(Room::getPrice).min(Long::compareTo).orElse(null);
        Long max = rooms.stream().map(Room::getPrice).max(Long::compareTo).orElse(null);
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
                h.getLandlord()
                        .getVerificationStatus() == VerificationStatus.APPROVED,
                h.getLandlord().getId(),
                h.getLandlord().getName(),
                h.isActive(),
                h.getCreatedAt());
    }
}
