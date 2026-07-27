package com.workhub.document;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local filesystem implementation of FileStorageService.
 * Activated when workhub.storage.type=local (default).
 * To swap to S3, create an S3FileStorageService with
 * {@code @ConditionalOnProperty(name = "workhub.storage.type", havingValue = "s3")}
 */
@Service
@ConditionalOnProperty(name = "workhub.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    private final Path uploadDir;

    public LocalFileStorageService(@Value("${workhub.storage.upload-dir:./uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public String store(MultipartFile file, String orgId) {
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                originalFilename = "unnamed";
            }
            // Sanitize filename
            originalFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

            String storedName = UUID.randomUUID() + "-" + originalFilename;
            Path orgDir = uploadDir.resolve(orgId);
            Files.createDirectories(orgDir);

            Path targetPath = orgDir.resolve(storedName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Return relative path
            return orgId + "/" + storedName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public Resource loadAsResource(String fileUrl) {
        try {
            Path filePath = uploadDir.resolve(fileUrl).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + fileUrl);
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + fileUrl, e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        try {
            Path filePath = uploadDir.resolve(fileUrl).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + fileUrl, e);
        }
    }
}
