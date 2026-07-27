package com.workhub.workitem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface WorkItemRepository extends JpaRepository<WorkItem, String>,
        JpaSpecificationExecutor<WorkItem> {

    Optional<WorkItem> findByIdAndOrgId(String id, String orgId);
    Page<WorkItem> findByOrgId(String orgId, Pageable pageable);
}
