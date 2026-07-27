package com.workhub.performance;

import com.workhub.masterdata.MasterDataRepository;
import com.workhub.masterdata.MasterDataService;
import com.workhub.masterdata.MasterDataType;
import com.workhub.performance.dto.CreateReviewRequest;
import com.workhub.performance.dto.ReviewResponse;
import com.workhub.user.User;
import com.workhub.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepository;
    private final MasterDataRepository masterDataRepository;
    private final MasterDataService masterDataService;
    private final UserRepository userRepository;

    public PerformanceReviewService(PerformanceReviewRepository reviewRepository,
                                    MasterDataRepository masterDataRepository,
                                    MasterDataService masterDataService,
                                    UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.masterDataRepository = masterDataRepository;
        this.masterDataService = masterDataService;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse create(CreateReviewRequest request, String reviewerId, String orgId) {
        masterDataService.validateMasterDataId(request.getPeriodId(), "REVIEW_PERIOD");

        User employee = userRepository.findById(request.getEmployeeId())
                .filter(u -> u.getOrgId().equals(orgId))
                .orElseThrow(() -> new EntityNotFoundException("Employee not found in your organization"));

        MasterDataType period = masterDataRepository.findById(request.getPeriodId()).orElseThrow();

        PerformanceReview review = new PerformanceReview();
        review.setEmployeeId(request.getEmployeeId());
        review.setReviewerId(reviewerId);
        review.setPeriod(period);
        review.setRating(request.getRating());
        review.setNotes(request.getNotes());
        review.setOrgId(orgId);

        return toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listByEmployee(String employeeId, String orgId) {
        return reviewRepository.findByEmployeeIdAndOrgIdOrderByCreatedAtDesc(employeeId, orgId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listAll(String orgId) {
        return reviewRepository.findByOrgIdOrderByCreatedAtDesc(orgId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReviewResponse getById(String id, String orgId) {
        PerformanceReview review = reviewRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Performance review not found"));
        return toResponse(review);
    }

    private ReviewResponse toResponse(PerformanceReview review) {
        String employeeName = userRepository.findById(review.getEmployeeId())
                .map(User::getFullName).orElse("Unknown");
        String reviewerName = userRepository.findById(review.getReviewerId())
                .map(User::getFullName).orElse("Unknown");

        return ReviewResponse.builder()
                .id(review.getId())
                .employeeId(review.getEmployeeId())
                .employeeName(employeeName)
                .reviewerId(review.getReviewerId())
                .reviewerName(reviewerName)
                .periodId(review.getPeriod().getId())
                .periodLabel(review.getPeriod().getLabel())
                .rating(review.getRating())
                .notes(review.getNotes())
                .orgId(review.getOrgId())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
