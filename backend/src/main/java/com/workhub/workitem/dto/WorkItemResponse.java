package com.workhub.workitem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkItemResponse {
    private String id;
    private String title;
    private String description;

    // Resolved type
    private Long typeId;
    private String typeCode;
    private String typeLabel;

    // Resolved status
    private Long statusId;
    private String statusCode;
    private String statusLabel;

    // Resolved priority
    private Long priorityId;
    private String priorityCode;
    private String priorityLabel;

    private Integer storyPoints;

    // Resolved assignee
    private String assigneeId;
    private String assigneeName;

    // Resolved reporter
    private String reporterId;
    private String reporterName;

    private String projectId;
    private String orgId;
    private LocalDate dueDate;
    private Instant createdAt;
    private Instant updatedAt;
}
