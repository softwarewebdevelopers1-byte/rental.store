package com.pata.keja.mapper;

import com.pata.keja.dto.rating.HostelRatingStatsResponse;
import com.pata.keja.dto.rating.RatingResponse;
import com.pata.keja.dto.rating.RatingSummaryResponse;
import com.pata.keja.models.Rating;
import com.pata.keja.models.Student;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Component
public class RatingMapper {

    public RatingSummaryResponse toSummary(Rating r) {
        Student s = r.getStudent();
        return new RatingSummaryResponse(
                r.getId(),
                r.getHostel().getId(),
                s.getId(),
                s.getName(),
                r.getStars(),
                r.getComment(),
                r.getCreatedAt());
    }

    public RatingResponse toResponse(Rating r) {
        Student s = r.getStudent();
        return new RatingResponse(
                r.getId(),
                r.getHostel().getId(),
                r.getHostel().getName(),
                s.getId(),
                s.getName(),
                s.getEmail(),
                r.getStars(),
                r.getComment(),
                r.getCreatedAt(),
                r.getUpdatedAt());
    }

    public HostelRatingStatsResponse toStats(String hostelId, List<Rating> ratings) {
        if (ratings.isEmpty()) {
            return new HostelRatingStatsResponse(hostelId, 0.0, 0, emptyDistribution());
        }
        double avg = ratings.stream().mapToInt(Rating::getStars).average().orElse(0.0);
        Map<Integer, Long> distribution = ratings.stream()
                .collect(Collectors.groupingBy(
                        Rating::getStars,
                        TreeMap::new,
                        Collectors.counting()));
        // Fill in missing buckets so the frontend always gets 1..5
        for (int i = 1; i <= 5; i++) {
            distribution.putIfAbsent(i, 0L);
        }
        return new HostelRatingStatsResponse(hostelId, Math.round(avg * 10.0) / 10.0, ratings.size(), distribution);
    }

    private static Map<Integer, Long> emptyDistribution() {
        Map<Integer, Long> m = new TreeMap<>();
        for (int i = 1; i <= 5; i++)
            m.put(i, 0L);
        return m;
    }
}
