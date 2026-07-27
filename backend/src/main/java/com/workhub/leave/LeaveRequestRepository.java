package com.workhub.leave;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, String> {
    List<LeaveRequest> findByUserIdAndOrgIdOrderByCreatedAtDesc(String userId, String orgId);
    List<LeaveRequest> findByOrgIdOrderByCreatedAtDesc(String orgId);
    Optional<LeaveRequest> findByIdAndOrgId(String id, String orgId);
}
