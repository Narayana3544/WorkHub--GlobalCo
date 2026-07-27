package com.workhub.performance;

import com.workhub.performance.dto.CreateReviewRequest;
import com.workhub.performance.dto.ReviewResponse;
import com.workhub.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class PerformanceReviewController {

    private final PerformanceReviewService reviewService;

    public PerformanceReviewController(PerformanceReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ReviewResponse> create(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(request, principal.getUserId(), principal.getOrgId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<ReviewResponse>> listMine(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(reviewService.listByEmployee(
                principal.getUserId(), principal.getOrgId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<ReviewResponse>> listAll(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(reviewService.listAll(principal.getOrgId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ReviewResponse> getById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(reviewService.getById(id, principal.getOrgId()));
    }
}
