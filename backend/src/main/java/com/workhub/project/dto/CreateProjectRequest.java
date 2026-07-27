package com.workhub.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    @NotBlank(message = "Project key is required")
    @Size(min = 2, max = 10, message = "Project key must be 2-10 characters")
    @Pattern(regexp = "^[A-Z][A-Z0-9]*$", message = "Project key must be uppercase letters/digits, starting with a letter")
    private String projectKey;

    private String description;
}
