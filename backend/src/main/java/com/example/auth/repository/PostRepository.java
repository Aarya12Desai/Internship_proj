package com.example.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.auth.model.Post;
import com.example.auth.model.PostStatus;
import com.example.auth.model.User;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Find posts by author
    List<Post> findByAuthorAndStatusOrderByCreatedAtDesc(User author, PostStatus status);
    
    // Find all active posts with pagination
    Page<Post> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);
    
    // Find posts by author with pagination
    Page<Post> findByAuthorAndStatusOrderByCreatedAtDesc(User author, PostStatus status, Pageable pageable);
    
    // Find post by ID and status
    Optional<Post> findByIdAndStatus(Long id, PostStatus status);
    
    // Get total posts count by user
    @Query("SELECT COUNT(p) FROM Post p WHERE p.author = :author AND p.status = :status")
    Long countByAuthorAndStatus(@Param("author") User author, @Param("status") PostStatus status);
    
    // Get user's feed (this would be expanded for following/friends feature)
    @Query("SELECT p FROM Post p WHERE p.status = :status ORDER BY p.createdAt DESC")
    Page<Post> findUserFeed(@Param("status") PostStatus status, Pageable pageable);
    
    // Search posts by content
    @Query("SELECT p FROM Post p WHERE p.status = :status AND LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.createdAt DESC")
    Page<Post> searchByContent(@Param("keyword") String keyword, @Param("status") PostStatus status, Pageable pageable);
    
    // Get trending posts (by likes count)
    @Query("SELECT p FROM Post p WHERE p.status = :status AND p.createdAt >= CURRENT_DATE - 7 ORDER BY p.likesCount DESC, p.createdAt DESC")
    Page<Post> findTrendingPosts(@Param("status") PostStatus status, Pageable pageable);
}
