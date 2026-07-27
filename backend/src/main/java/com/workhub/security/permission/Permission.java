package com.workhub.security.permission;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "permissions")
@Data
public class Permission {
    @Id
    private String id;
    
    private String description;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
