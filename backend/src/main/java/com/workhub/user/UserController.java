package com.workhub.user;

import com.workhub.security.UserPrincipal;
import com.workhub.user.dto.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getUserById(principal.getUserId(), principal.getOrgId());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<UserResponse> listUsers(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.listUsersByOrg(principal.getOrgId());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public UserResponse getUser(@PathVariable String id,
                                @AuthenticationPrincipal UserPrincipal principal) {
        return userService.getUserById(id, principal.getOrgId());
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateRole(@PathVariable String id,
                                    @RequestParam String role,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return userService.updateUserRole(id, role, principal.getOrgId());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateStatus(@PathVariable String id,
                                      @RequestParam String status,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        return userService.updateUserStatus(id, status, principal.getOrgId());
    }
}
