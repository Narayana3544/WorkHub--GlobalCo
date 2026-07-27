package com.workhub.document;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction for file storage. Implementations can store files locally or on S3.
 * Swap by changing workhub.storage.type in application.yml — one-line config change.
 */
public interface FileStorageService {

    /**
     * Store a file and return the relative path/URL.
     *
     * @param file  the uploaded file
     * @param orgId the organization ID (used for directory partitioning)
     * @return the relative storage path/URL
     */
    String store(MultipartFile file, String orgId);

    /**
     * Load a file as a Resource for download.
     *
     * @param fileUrl the path returned by store()
     * @return the file as a Spring Resource
     */
    Resource loadAsResource(String fileUrl);

    /**
     * Delete a stored file.
     *
     * @param fileUrl the path returned by store()
     */
    void delete(String fileUrl);
}
