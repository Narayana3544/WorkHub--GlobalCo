package com.workhub.leave;

import com.workhub.leave.dto.CreateLeaveRequest;
import com.workhub.leave.dto.LeaveRequestResponse;
import com.workhub.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<LeaveRequestResponse> create(
            @Valid @RequestBody CreateLeaveRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveRequestService.create(request, principal.getUserId(), principal.getOrgId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<LeaveRequestResponse>> listMine(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leaveRequestService.listMyRequests(
                principal.getUserId(), principal.getOrgId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<LeaveRequestResponse>> listAll(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leaveRequestService.listAllForOrg(principal.getOrgId()));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<LeaveRequestResponse> approve(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leaveRequestService.approve(
                id, principal.getUserId(), principal.getOrgId()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<LeaveRequestResponse> reject(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leaveRequestService.reject(
                id, principal.getUserId(), principal.getOrgId()));
    }
}
