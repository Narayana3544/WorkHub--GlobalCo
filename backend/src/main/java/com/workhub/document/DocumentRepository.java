package com.workhub.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findByOwnerTypeAndOwnerIdAndOrgId(String ownerType, String ownerId, String orgId);
    Optional<Document> findByIdAndOrgId(String id, String orgId);
}
