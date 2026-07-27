package com.workhub.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private String id;
    private String name;
    private String projectKey;
    private String description;
    private String orgId;
    private Instant createdAt;
    private Instant updatedAt;
}
