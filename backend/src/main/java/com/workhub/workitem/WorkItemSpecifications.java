package com.workhub.workitem;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic filter specifications for WorkItem queries.
 */
public final class WorkItemSpecifications {

    private WorkItemSpecifications() {}

    public static Specification<WorkItem> withFilters(String orgId,
                                                       String projectId,
                                                       Long statusId,
                                                       Long typeId,
                                                       Long priorityId,
                                                       String assigneeId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by org (tenant isolation)
            predicates.add(cb.equal(root.get("orgId"), orgId));

            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }
            if (statusId != null) {
                predicates.add(cb.equal(root.get("status").get("id"), statusId));
            }
            if (typeId != null) {
                predicates.add(cb.equal(root.get("type").get("id"), typeId));
            }
            if (priorityId != null) {
                predicates.add(cb.equal(root.get("priority").get("id"), priorityId));
            }
            if (assigneeId != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
