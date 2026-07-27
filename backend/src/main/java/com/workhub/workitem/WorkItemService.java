package com.workhub.workitem;

import com.workhub.masterdata.MasterDataRepository;
import com.workhub.masterdata.MasterDataService;
import com.workhub.masterdata.MasterDataType;
import com.workhub.user.User;
import com.workhub.user.UserRepository;
import com.workhub.workitem.dto.CreateWorkItemRequest;
import com.workhub.workitem.dto.UpdateWorkItemRequest;
import com.workhub.workitem.dto.WorkItemResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkItemService {

    private final WorkItemRepository workItemRepository;
    private final MasterDataRepository masterDataRepository;
    private final MasterDataService masterDataService;
    private final UserRepository userRepository;

    public WorkItemService(WorkItemRepository workItemRepository,
                           MasterDataRepository masterDataRepository,
                           MasterDataService masterDataService,
                           UserRepository userRepository) {
        this.workItemRepository = workItemRepository;
        this.masterDataRepository = masterDataRepository;
        this.masterDataService = masterDataService;
        this.userRepository = userRepository;
    }

    @Transactional
    public WorkItemResponse create(CreateWorkItemRequest request, String reporterId, String orgId) {
        // Validate master data IDs
        masterDataService.validateMasterDataId(request.getTypeId(), "WORK_ITEM_TYPE");
        masterDataService.validateMasterDataId(request.getPriorityId(), "WORK_ITEM_PRIORITY");

        MasterDataType type = masterDataRepository.findById(request.getTypeId()).orElseThrow();
        MasterDataType priority = masterDataRepository.findById(request.getPriorityId()).orElseThrow();

        // Default status to OPEN
        MasterDataType status = masterDataRepository.findByCategoryAndCode("WORK_ITEM_STATUS", "OPEN")
                .orElseThrow(() -> new IllegalStateException("Default status 'OPEN' not found in master data"));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new EntityNotFoundException("Reporter not found"));

        WorkItem workItem = new WorkItem();
        workItem.setTitle(request.getTitle());
        workItem.setDescription(request.getDescription());
        workItem.setType(type);
        workItem.setStatus(status);
        workItem.setPriority(priority);
        workItem.setStoryPoints(request.getStoryPoints());
        workItem.setReporter(reporter);
        workItem.setProjectId(request.getProjectId());
        workItem.setOrgId(orgId);
        workItem.setDueDate(request.getDueDate());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .filter(u -> u.getOrgId().equals(orgId))
                    .orElseThrow(() -> new EntityNotFoundException("Assignee not found in your organization"));
            workItem.setAssignee(assignee);
        }

        workItem = workItemRepository.save(workItem);
        return toResponse(workItem);
    }

    @Transactional(readOnly = true)
    public WorkItemResponse getById(String id, String orgId) {
        WorkItem item = workItemRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Work item not found"));
        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public Page<WorkItemResponse> list(String orgId, String projectId, Long statusId,
                                        Long typeId, Long priorityId, String assigneeId,
                                        Pageable pageable) {
        Specification<WorkItem> spec = WorkItemSpecifications.withFilters(
                orgId, projectId, statusId, typeId, priorityId, assigneeId);
        return workItemRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional
    public WorkItemResponse update(String id, UpdateWorkItemRequest request, String orgId) {
        WorkItem item = workItemRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Work item not found"));

        if (request.getTitle() != null) {
            item.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getTypeId() != null) {
            masterDataService.validateMasterDataId(request.getTypeId(), "WORK_ITEM_TYPE");
            item.setType(masterDataRepository.findById(request.getTypeId()).orElseThrow());
        }
        if (request.getStatusId() != null) {
            masterDataService.validateMasterDataId(request.getStatusId(), "WORK_ITEM_STATUS");
            item.setStatus(masterDataRepository.findById(request.getStatusId()).orElseThrow());
        }
        if (request.getPriorityId() != null) {
            masterDataService.validateMasterDataId(request.getPriorityId(), "WORK_ITEM_PRIORITY");
            item.setPriority(masterDataRepository.findById(request.getPriorityId()).orElseThrow());
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .filter(u -> u.getOrgId().equals(orgId))
                    .orElseThrow(() -> new EntityNotFoundException("Assignee not found in your organization"));
            item.setAssignee(assignee);
        }
        if (request.getStoryPoints() != null) {
            item.setStoryPoints(request.getStoryPoints());
        }
        if (request.getDueDate() != null) {
            item.setDueDate(request.getDueDate());
        }

        return toResponse(workItemRepository.save(item));
    }

    @Transactional
    public void delete(String id, String orgId) {
        WorkItem item = workItemRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Work item not found"));
        workItemRepository.delete(item);
    }

    @Transactional
    public WorkItemResponse assign(String id, String assigneeId, String orgId) {
        WorkItem item = workItemRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Work item not found"));

        User assignee = userRepository.findById(assigneeId)
                .filter(u -> u.getOrgId().equals(orgId))
                .orElseThrow(() -> new EntityNotFoundException("Assignee not found in your organization"));

        item.setAssignee(assignee);
        return toResponse(workItemRepository.save(item));
    }

    @Transactional
    public WorkItemResponse updateStatus(String id, Long statusId, String statusCode, String orgId,
                                          String userId, String userRole) {
        WorkItem item = workItemRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Work item not found"));

        // Employees can only transition status of items assigned to them
        if ("EMPLOYEE".equals(userRole)) {
            if (item.getAssignee() == null || !item.getAssignee().getId().equals(userId)) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Employees can only update status of work items assigned to them");
            }
        }

        MasterDataType newStatus;
        if (statusId != null && statusId > 0) {
            masterDataService.validateMasterDataId(statusId, "WORK_ITEM_STATUS");
            newStatus = masterDataRepository.findById(statusId).orElseThrow();
        } else if (statusCode != null && !statusCode.isBlank()) {
            String dbCode = statusCode;
            if ("TODO".equals(statusCode) || "BACKLOG".equals(statusCode)) dbCode = "OPEN";
            if ("REVIEW".equals(statusCode)) dbCode = "IN_REVIEW";

            final String finalCode = dbCode;
            newStatus = masterDataRepository.findByCategoryAndCode("WORK_ITEM_STATUS", finalCode)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid status code: " + finalCode));
        } else {
            throw new IllegalArgumentException("Either statusId or statusCode must be provided");
        }

        item.setStatus(newStatus);
        return toResponse(workItemRepository.save(item));
    }

    private WorkItemResponse toResponse(WorkItem item) {
        WorkItemResponse.WorkItemResponseBuilder builder = WorkItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .typeId(item.getType().getId())
                .typeCode(item.getType().getCode())
                .typeLabel(item.getType().getLabel())
                .statusId(item.getStatus().getId())
                .statusCode(item.getStatus().getCode())
                .statusLabel(item.getStatus().getLabel())
                .priorityId(item.getPriority().getId())
                .priorityCode(item.getPriority().getCode())
                .priorityLabel(item.getPriority().getLabel())
                .storyPoints(item.getStoryPoints())
                .reporterId(item.getReporter().getId())
                .reporterName(item.getReporter().getFullName())
                .projectId(item.getProjectId())
                .orgId(item.getOrgId())
                .dueDate(item.getDueDate())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt());

        if (item.getAssignee() != null) {
            builder.assigneeId(item.getAssignee().getId())
                   .assigneeName(item.getAssignee().getFullName());
        }

        return builder.build();
    }
}
