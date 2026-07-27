package com.workhub.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private String id;
    private String employeeId;
    private String employeeName;
    private String reviewerId;
    private String reviewerName;
    private Long periodId;
    private String periodLabel;
    private int rating;
    private String notes;
    private String orgId;
    private Instant createdAt;
}
