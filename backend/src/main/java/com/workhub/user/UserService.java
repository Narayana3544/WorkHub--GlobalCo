package com.workhub.user;

import com.workhub.user.dto.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private static final Set<String> VALID_ROLES = Set.of("EMPLOYEE", "MANAGER", "ADMIN");
    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "INACTIVE");

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String userId, String orgId) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getOrgId().equals(orgId))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsersByOrg(String orgId) {
        return userRepository.findByOrgId(orgId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUserRole(String userId, String role, String orgId) {
        if (!VALID_ROLES.contains(role)) {
            throw new IllegalArgumentException("Invalid role: " + role + ". Must be one of: " + VALID_ROLES);
        }
        User user = userRepository.findById(userId)
                .filter(u -> u.getOrgId().equals(orgId))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserStatus(String userId, String status, String orgId) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Must be one of: " + VALID_STATUSES);
        }
        User user = userRepository.findById(userId)
                .filter(u -> u.getOrgId().equals(orgId))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setStatus(status);
        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .orgId(user.getOrgId())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
