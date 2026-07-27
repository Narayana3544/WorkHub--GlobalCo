package com.workhub.leave;

import com.workhub.common.BaseEntity;
import com.workhub.masterdata.MasterDataType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest extends BaseEntity {

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private MasterDataType type;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private MasterDataType status;

    @Column(name = "approver_id", length = 36)
    private String approverId;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "org_id", nullable = false, length = 36)
    private String orgId;
}
