package com.workhub.leave;

import com.workhub.leave.dto.CreateLeaveRequest;
import com.workhub.leave.dto.LeaveRequestResponse;
import com.workhub.masterdata.MasterDataRepository;
import com.workhub.masterdata.MasterDataService;
import com.workhub.masterdata.MasterDataType;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final MasterDataRepository masterDataRepository;
    private final MasterDataService masterDataService;

    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository,
                               MasterDataRepository masterDataRepository,
                               MasterDataService masterDataService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.masterDataRepository = masterDataRepository;
        this.masterDataService = masterDataService;
    }

    @Transactional
    public LeaveRequestResponse create(CreateLeaveRequest request, String userId, String orgId) {
        masterDataService.validateMasterDataId(request.getTypeId(), "LEAVE_TYPE");

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be on or after start date");
        }

        // Check for overlapping leave requests (non-rejected/cancelled)
        var overlapping = leaveRequestRepository.findOverlappingLeaves(
                userId, orgId, request.getStartDate(), request.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException(
                    "Leave request overlaps with an existing request from "
                            + overlapping.get(0).getStartDate() + " to " + overlapping.get(0).getEndDate());
        }

        MasterDataType type = masterDataRepository.findById(request.getTypeId()).orElseThrow();
        MasterDataType pendingStatus = masterDataRepository.findByCategoryAndCode("LEAVE_STATUS", "PENDING")
                .orElseThrow(() -> new IllegalStateException("Default status 'PENDING' not found in master data"));

        LeaveRequest leave = new LeaveRequest();
        leave.setUserId(userId);
        leave.setType(type);
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setStatus(pendingStatus);
        leave.setReason(request.getReason());
        leave.setOrgId(orgId);

        return toResponse(leaveRequestRepository.save(leave));
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> listMyRequests(String userId, String orgId) {
        return leaveRequestRepository.findByUserIdAndOrgIdOrderByCreatedAtDesc(userId, orgId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> listAllForOrg(String orgId) {
        return leaveRequestRepository.findByOrgIdOrderByCreatedAtDesc(orgId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LeaveRequestResponse approve(String id, String approverId, String orgId) {
        return updateStatus(id, "APPROVED", approverId, orgId);
    }

    @Transactional
    public LeaveRequestResponse reject(String id, String approverId, String orgId) {
        return updateStatus(id, "REJECTED", approverId, orgId);
    }

    private LeaveRequestResponse updateStatus(String id, String statusCode,
                                               String approverId, String orgId) {
        LeaveRequest leave = leaveRequestRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found"));

        // Block self-approval: a manager/admin cannot approve/reject their own leave
        if (approverId.equals(leave.getUserId())) {
            throw new IllegalArgumentException("You cannot approve or reject your own leave request");
        }

        MasterDataType newStatus = masterDataRepository.findByCategoryAndCode("LEAVE_STATUS", statusCode)
                .orElseThrow(() -> new IllegalStateException("Status '" + statusCode + "' not found"));

        leave.setStatus(newStatus);
        leave.setApproverId(approverId);

        return toResponse(leaveRequestRepository.save(leave));
    }

    private LeaveRequestResponse toResponse(LeaveRequest leave) {
        return LeaveRequestResponse.builder()
                .id(leave.getId())
                .userId(leave.getUserId())
                .typeId(leave.getType().getId())
                .typeLabel(leave.getType().getLabel())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .statusId(leave.getStatus().getId())
                .statusLabel(leave.getStatus().getLabel())
                .approverId(leave.getApproverId())
                .reason(leave.getReason())
                .orgId(leave.getOrgId())
                .createdAt(leave.getCreatedAt())
                .build();
    }
}
