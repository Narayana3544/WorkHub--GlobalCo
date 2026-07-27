package com.workhub.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, String> {
    List<Project> findByOrgId(String orgId);
    Optional<Project> findByIdAndOrgId(String id, String orgId);
    boolean existsByProjectKeyAndOrgId(String projectKey, String orgId);
}
