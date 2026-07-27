package com.workhub.performance;

import com.workhub.common.BaseEntity;
import com.workhub.masterdata.MasterDataType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "performance_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReview extends BaseEntity {

    @Column(name = "employee_id", nullable = false, length = 36)
    private String employeeId;

    @Column(name = "reviewer_id", nullable = false, length = 36)
    private String reviewerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private MasterDataType period;

    @Column(nullable = false)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "org_id", nullable = false, length = 36)
    private String orgId;
}
