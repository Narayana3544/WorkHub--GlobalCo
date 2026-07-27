package com.workhub.leave;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, String> {
    List<LeaveRequest> findByUserIdAndOrgIdOrderByCreatedAtDesc(String userId, String orgId);
    List<LeaveRequest> findByOrgIdOrderByCreatedAtDesc(String orgId);
    Optional<LeaveRequest> findByIdAndOrgId(String id, String orgId);

    /**
     * Find overlapping leave requests for the same user that are not rejected/cancelled.
     * Two date ranges [A_start, A_end] and [B_start, B_end] overlap when A_start <= B_end AND A_end >= B_start.
     */
    @Query("SELECT lr FROM LeaveRequest lr JOIN lr.status s WHERE lr.userId = :userId " +
           "AND lr.orgId = :orgId " +
           "AND s.code NOT IN ('REJECTED', 'CANCELLED') " +
           "AND lr.startDate <= :endDate AND lr.endDate >= :startDate")
    List<LeaveRequest> findOverlappingLeaves(
            @Param("userId") String userId,
            @Param("orgId") String orgId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
