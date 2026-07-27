package com.workhub.performance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, String> {
    List<PerformanceReview> findByEmployeeIdAndOrgIdOrderByCreatedAtDesc(String employeeId, String orgId);
    List<PerformanceReview> findByOrgIdOrderByCreatedAtDesc(String orgId);
    Optional<PerformanceReview> findByIdAndOrgId(String id, String orgId);
}
