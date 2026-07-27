package com.workhub.document;

import com.workhub.config.FileStorageConfig;
import com.workhub.document.dto.DocumentResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final Set<String> allowedTypes;
    private final long maxFileSizeBytes;

    public DocumentService(DocumentRepository documentRepository,
                           FileStorageService fileStorageService,
                           FileStorageConfig storageConfig) {
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
        this.allowedTypes = Set.copyOf(storageConfig.getAllowedTypes());
        this.maxFileSizeBytes = storageConfig.getMaxFileSizeBytes();
    }

    @Transactional
    public DocumentResponse upload(MultipartFile file, String ownerType, String ownerId,
                                    String uploadedBy, String orgId) {
        // Validate MIME type
        String mimeType = file.getContentType();
        if (mimeType == null || !allowedTypes.contains(mimeType)) {
            throw new IllegalArgumentException(
                    "File type '" + mimeType + "' is not allowed. Allowed types: " + allowedTypes);
        }

        // Validate file size
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException(
                    "File size " + file.getSize() + " bytes exceeds maximum of " + maxFileSizeBytes + " bytes");
        }

        // Store file
        String fileUrl = fileStorageService.store(file, orgId);

        // Save metadata
        Document document = new Document();
        document.setFileName(file.getOriginalFilename());
        document.setFileUrl(fileUrl);
        document.setMimeType(mimeType);
        document.setFileSize(file.getSize());
        document.setUploadedBy(uploadedBy);
        document.setOwnerType(ownerType);
        document.setOwnerId(ownerId);
        document.setOrgId(orgId);

        return toResponse(documentRepository.save(document));
    }

    @Transactional(readOnly = true)
    public Resource download(String documentId, String orgId) {
        Document doc = documentRepository.findByIdAndOrgId(documentId, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        return fileStorageService.loadAsResource(doc.getFileUrl());
    }

    @Transactional(readOnly = true)
    public Document getDocumentEntity(String documentId, String orgId) {
        return documentRepository.findByIdAndOrgId(documentId, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listByOwner(String ownerType, String ownerId, String orgId) {
        return documentRepository.findByOwnerTypeAndOwnerIdAndOrgId(ownerType, ownerId, orgId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void delete(String documentId, String orgId) {
        Document doc = documentRepository.findByIdAndOrgId(documentId, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        fileStorageService.delete(doc.getFileUrl());
        documentRepository.delete(doc);
    }

    private DocumentResponse toResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileUrl(doc.getFileUrl())
                .mimeType(doc.getMimeType())
                .fileSize(doc.getFileSize())
                .uploadedBy(doc.getUploadedBy())
                .ownerType(doc.getOwnerType())
                .ownerId(doc.getOwnerId())
                .orgId(doc.getOrgId())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
