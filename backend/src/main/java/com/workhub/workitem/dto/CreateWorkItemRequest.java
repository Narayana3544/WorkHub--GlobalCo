package com.workhub.workitem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Type ID is required")
    private Long typeId;

    @NotNull(message = "Priority ID is required")
    private Long priorityId;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    private String assigneeId;

    private Integer storyPoints;

    private LocalDate dueDate;
}
