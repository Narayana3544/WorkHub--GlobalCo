package com.workhub.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private String id;
    private String fileName;
    private String fileUrl;
    private String mimeType;
    private long fileSize;
    private String uploadedBy;
    private String ownerType;
    private String ownerId;
    private String orgId;
    private Instant createdAt;
}
