package com.workhub.document;

import com.workhub.document.dto.DocumentResponse;
import com.workhub.security.UserPrincipal;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Upload a document (multipart). Validates MIME type and size.
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam String ownerType,
            @RequestParam String ownerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        DocumentResponse response = documentService.upload(
                file, ownerType, ownerId,
                principal.getUserId(), principal.getOrgId());
        return ResponseEntity.status(201).body(response);
    }

    /**
     * Download a document by ID.
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Resource> download(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Document doc = documentService.getDocumentEntity(id, principal.getOrgId());
        Resource resource = documentService.download(id, principal.getOrgId());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    /**
     * List documents by owner (e.g., all documents for a work item).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<DocumentResponse>> listByOwner(
            @RequestParam String ownerType,
            @RequestParam String ownerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(documentService.listByOwner(ownerType, ownerId, principal.getOrgId()));
    }

    /**
     * Delete a document. Owner or ADMIN only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        documentService.delete(id, principal.getOrgId(), principal.getUserId(), principal.getRole());
        return ResponseEntity.noContent().build();
    }
}
