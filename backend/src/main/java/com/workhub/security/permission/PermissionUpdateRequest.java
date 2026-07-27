package com.workhub.security.permission;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class PermissionUpdateRequest {
    @NotBlank
    private String role;
    
    @NotBlank
    private String permissionId;
    
    @NotNull
    private Boolean isEnabled;
}
