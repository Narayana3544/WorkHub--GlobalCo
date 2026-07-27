package com.workhub.security.permission;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final RolePermissionRepository repository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RolePermission>> getAllPermissions() {
        return ResponseEntity.ok(repository.findAllByOrderByRoleAscPermissionIdAsc());
    }

    @PatchMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RolePermission> updatePermission(@Valid @RequestBody PermissionUpdateRequest request) {
        RolePermission rolePermission = repository.findByRoleAndPermissionId(request.getRole(), request.getPermissionId())
                .orElseThrow(() -> new RuntimeException("Permission mapping not found"));
        
        // Safety lock: Do not allow disabling Admin's MANAGE_SYSTEM permission to prevent lockouts
        if ("ADMIN".equals(request.getRole()) && "MANAGE_SYSTEM".equals(request.getPermissionId()) && !request.getIsEnabled()) {
            throw new IllegalArgumentException("Cannot disable core system management for ADMIN");
        }

        rolePermission.setEnabled(request.getIsEnabled());
        return ResponseEntity.ok(repository.save(rolePermission));
    }
}
