package com.workhub.project;

import com.workhub.project.dto.CreateProjectRequest;
import com.workhub.project.dto.ProjectResponse;
import com.workhub.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProjectResponse> create(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.create(request, principal.getOrgId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<ProjectResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(projectService.listByOrg(principal.getOrgId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ProjectResponse> getById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(projectService.getById(id, principal.getOrgId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProjectResponse> update(
            @PathVariable String id,
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(projectService.update(id, request, principal.getOrgId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        projectService.delete(id, principal.getOrgId());
        return ResponseEntity.noContent().build();
    }
}
