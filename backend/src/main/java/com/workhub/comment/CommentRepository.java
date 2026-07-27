package com.workhub.comment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByWorkItemIdOrderByCreatedAtDesc(String workItemId);
}
