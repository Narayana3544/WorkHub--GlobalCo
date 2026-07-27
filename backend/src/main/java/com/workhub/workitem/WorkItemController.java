package com.workhub.workitem;

import com.workhub.security.UserPrincipal;
import com.workhub.workitem.dto.CreateWorkItemRequest;
import com.workhub.workitem.dto.UpdateWorkItemRequest;
import com.workhub.workitem.dto.WorkItemResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workitems")
public class WorkItemController {

    private final WorkItemService workItemService;

    public WorkItemController(WorkItemService workItemService) {
        this.workItemService = workItemService;
    }

    /**
     * Create a new work item. Only MANAGER and ADMIN can create.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<WorkItemResponse> create(
            @Valid @RequestBody CreateWorkItemRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        WorkItemResponse response = workItemService.create(
                request, principal.getUserId(), principal.getOrgId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * List work items with optional filters and pagination.
     * All authenticated users can list items within their org.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Page<WorkItemResponse>> list(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) Long priorityId,
            @RequestParam(required = false) String assigneeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        Page<WorkItemResponse> page = workItemService.list(
                principal.getOrgId(), projectId, statusId, typeId, priorityId, assigneeId, pageable);
        return ResponseEntity.ok(page);
    }

    /**
     * Get a single work item by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<WorkItemResponse> getById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workItemService.getById(id, principal.getOrgId()));
    }

    /**
     * Update a work item. MANAGER, ADMIN, or the assignee can update.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<WorkItemResponse> update(
            @PathVariable String id,
            @RequestBody UpdateWorkItemRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workItemService.update(id, request, principal.getOrgId()));
    }

    /**
     * Delete a work item. ADMIN only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        workItemService.delete(id, principal.getOrgId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Assign a work item to a user. MANAGER and ADMIN only.
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<WorkItemResponse> assign(
            @PathVariable String id,
            @RequestParam String assigneeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workItemService.assign(id, assigneeId, principal.getOrgId()));
    }

    /**
     * Update work item status. All authenticated users can transition status.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<WorkItemResponse> updateStatus(
            @PathVariable String id,
            @RequestParam Long statusId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workItemService.updateStatus(id, statusId, principal.getOrgId()));
    }
}
