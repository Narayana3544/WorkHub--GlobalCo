package com.workhub.comment;

import com.workhub.comment.dto.CommentResponse;
import com.workhub.comment.dto.CreateCommentRequest;
import com.workhub.user.User;
import com.workhub.user.UserRepository;
import com.workhub.workitem.WorkItem;
import com.workhub.workitem.WorkItemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final WorkItemRepository workItemRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          WorkItemRepository workItemRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.workItemRepository = workItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CommentResponse create(String workItemId, CreateCommentRequest request,
                                   String authorId, String orgId) {
        // Verify work item exists and belongs to the user's org
        workItemRepository.findByIdAndOrgId(workItemId, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Work item not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthorId(authorId);
        comment.setWorkItemId(workItemId);
        comment = commentRepository.save(comment);

        return toResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> listByWorkItem(String workItemId, String orgId) {
        workItemRepository.findByIdAndOrgId(workItemId, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Work item not found"));

        return commentRepository.findByWorkItemIdOrderByCreatedAtDesc(workItemId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void delete(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        if (!comment.getAuthorId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment) {
        String authorName = userRepository.findById(comment.getAuthorId())
                .map(User::getFullName)
                .orElse("Unknown");

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorId(comment.getAuthorId())
                .authorName(authorName)
                .workItemId(comment.getWorkItemId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
