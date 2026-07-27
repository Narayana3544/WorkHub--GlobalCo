package com.workhub.leave.dto;

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
public class LeaveRequestResponse {
    private String id;
    private String userId;
    private Long typeId;
    private String typeLabel;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long statusId;
    private String statusLabel;
    private String approverId;
    private String reason;
    private String orgId;
    private Instant createdAt;
}
