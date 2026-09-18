package com.pata.keja.service.impl;

import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.dto.rating.*;
import com.pata.keja.models.Hostel;
import com.pata.keja.models.Rating;
import com.pata.keja.models.Student;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.exception.NotFoundException;
import com.pata.keja.mapper.RatingMapper;
import com.pata.keja.repository.HostelRepository;
import com.pata.keja.repository.RatingRepository;
import com.pata.keja.repository.StudentRepository;
import com.pata.keja.service.RatingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepo;
    private final HostelRepository hostelRepo;
    private final StudentRepository studentRepo;
    private final RatingMapper ratingMapper;

    public RatingServiceImpl(RatingRepository ratingRepo,
            HostelRepository hostelRepo,
            StudentRepository studentRepo,
            RatingMapper ratingMapper) {
        this.ratingRepo = ratingRepo;
        this.hostelRepo = hostelRepo;
        this.studentRepo = studentRepo;
        this.ratingMapper = ratingMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingSummaryResponse> listForHostel(String hostelId) {
        return ratingRepo.findAllForHostel(hostelId).stream()
                .map(ratingMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingSummaryResponse> listByStudent(String studentId) {
        return ratingRepo.findAllByStudent(studentId).stream()
                .map(ratingMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HostelRatingStatsResponse statsForHostel(String hostelId) {
        return ratingMapper.toStats(hostelId, ratingRepo.findAllForHostel(hostelId));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RatingResponse> findMyRatingForHostel(String studentId, String hostelId) {
        return ratingRepo.findByHostelIdAndStudentId(hostelId, studentId)
                .map(ratingMapper::toResponse);
    }

    @Override
    public RatingResponse upsert(String studentId, String hostelId, RatingCreateRequest req) {
        Student student = studentRepo.findWithAssociationsById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        Hostel hostel = hostelRepo.findById(hostelId)
                .orElseThrow(() -> new NotFoundException("Hostel not found"));

        // Only active tenants of this hostel can rate it.
        boolean isActiveTenant = student.getMembershipStatus() == MembershipStatus.ACTIVE
                && student.getHostel() != null
                && student.getHostel().getId().equals(hostelId);
        if (!isActiveTenant) {
            throw new ConflictException("Only active tenants of this hostel can rate it.");
        }

        Rating rating = ratingRepo.findByHostelIdAndStudentId(hostelId, studentId)
                .orElseGet(() -> {
                    Rating r = new Rating();
                    r.setStudent(student);
                    r.setHostel(hostel);
                    return r;
                });
        rating.setStars(req.stars());
        rating.setComment(req.comment());
        ratingRepo.save(rating);

        recomputeHostelAggregates(hostel);
        return ratingMapper.toResponse(rating);
    }

    @Override
    public void delete(String ratingId, String requesterId) {
        Rating rating = ratingRepo.findByIdWithAssociations(ratingId)
                .orElseThrow(() -> new NotFoundException("Rating not found"));

        if (!rating.getStudent().getId().equals(requesterId)) {
            throw new ConflictException("You can only delete your own rating.");
        }
        Hostel hostel = rating.getHostel();
        ratingRepo.delete(rating);
        recomputeHostelAggregates(hostel);
    }

    /**
     * Keeps the denormalized rating + review count on Hostel in sync.
     * Runs inside the same transaction as the write.
     */
    private void recomputeHostelAggregates(Hostel hostel) {
        Double avg = ratingRepo.averageStarsForHostel(hostel.getId());
        long count = ratingRepo.countByHostelId(hostel.getId());
        hostel.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        hostel.setReviewCount((int) count);
    }
}
