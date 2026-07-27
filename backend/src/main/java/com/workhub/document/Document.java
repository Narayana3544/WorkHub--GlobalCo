package com.workhub.document;

import com.workhub.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Document extends BaseEntity {

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "file_size", nullable = false)
    private long fileSize;

    @Column(name = "uploaded_by", nullable = false, length = 36)
    private String uploadedBy;

    @Column(name = "owner_type", nullable = false, length = 50)
    private String ownerType;

    @Column(name = "owner_id", nullable = false, length = 36)
    private String ownerId;

    @Column(name = "org_id", nullable = false, length = 36)
    private String orgId;

    /**
     * Documents are immutable after creation — override preUpdate to be no-op.
     */
    @Override
    @PreUpdate
    public void preUpdate() {
        // Documents are immutable
    }
}
