package com.example.auth.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.auth.model.Comment;
import com.example.auth.model.CommentStatus;
import com.example.auth.model.Post;
import com.example.auth.model.User;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Find comments by post
    List<Comment> findByPostAndStatusOrderByCreatedAtAsc(Post post, CommentStatus status);
    
    // Find comments by post with pagination
    Page<Comment> findByPostAndStatusOrderByCreatedAtAsc(Post post, CommentStatus status, Pageable pageable);
    
    // Find top-level comments (no parent)
    List<Comment> findByPostAndStatusAndParentCommentIsNullOrderByCreatedAtAsc(Post post, CommentStatus status);
    
    // Find replies to a comment
    List<Comment> findByParentCommentAndStatusOrderByCreatedAtAsc(Comment parentComment, CommentStatus status);
    
    // Count comments for a post
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post = :post AND c.status = :status")
    Long countByPostAndStatus(@Param("post") Post post, @Param("status") CommentStatus status);
    
    // Find comments by author
    Page<Comment> findByAuthorAndStatusOrderByCreatedAtDesc(User author, CommentStatus status, Pageable pageable);
}
