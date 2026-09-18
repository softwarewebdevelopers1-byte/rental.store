package com.pata.keja.service;

import com.pata.keja.dto.rating.HostelRatingStatsResponse;
import com.pata.keja.dto.rating.RatingCreateRequest;
import com.pata.keja.dto.rating.RatingResponse;
import com.pata.keja.dto.rating.RatingSummaryResponse;

import java.util.List;
import java.util.Optional;

public interface RatingService {

    List<RatingSummaryResponse> listForHostel(String hostelId);

    List<RatingSummaryResponse> listByStudent(String studentId);

    HostelRatingStatsResponse statsForHostel(String hostelId);

    /** Returns the student's rating for a hostel if one exists. */
    Optional<RatingResponse> findMyRatingForHostel(String studentId, String hostelId);

    /**
     * Create or update the student's rating for the hostel they are a tenant of.
     */
    RatingResponse upsert(String studentId, String hostelId, RatingCreateRequest req);

    void delete(String ratingId, String requesterId);
}
