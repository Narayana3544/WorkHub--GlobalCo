package com.workhub.project;

import com.workhub.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Project extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "project_key", nullable = false, length = 10)
    private String projectKey;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "org_id", nullable = false, length = 36)
    private String orgId;
}
