package com.workhub.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private String id;
    private String content;
    private String authorId;
    private String authorName;
    private String workItemId;
    private Instant createdAt;
    private Instant updatedAt;
}
