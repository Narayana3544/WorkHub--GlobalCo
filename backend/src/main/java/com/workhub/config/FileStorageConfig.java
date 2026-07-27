package com.workhub.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "workhub.storage")
@Getter
@Setter
public class FileStorageConfig {

    private String type = "local";
    private String uploadDir = "./uploads";
    private List<String> allowedTypes = List.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private long maxFileSizeBytes = 10485760; // 10 MB
}
