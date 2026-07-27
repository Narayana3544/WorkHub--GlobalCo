package com.workhub.workitem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWorkItemRequest {
    private String title;
    private String description;
    private Long typeId;
    private Long statusId;
    private Long priorityId;
    private String assigneeId;
    private Integer storyPoints;
    private LocalDate dueDate;
}
