package com.workhub.comment;

import com.workhub.comment.dto.CommentResponse;
import com.workhub.comment.dto.CreateCommentRequest;
import com.workhub.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workitems/{workItemId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<CommentResponse> create(
            @PathVariable String workItemId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.create(workItemId, request,
                        principal.getUserId(), principal.getOrgId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<CommentResponse>> list(
            @PathVariable String workItemId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(commentService.listByWorkItem(workItemId, principal.getOrgId()));
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable String workItemId,
            @PathVariable String commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        commentService.delete(commentId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
