package com.example.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.auth.model.Post;
import com.example.auth.model.PostLike;
import com.example.auth.model.User;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    
    // Check if user has liked a post
    boolean existsByPostAndUser(Post post, User user);
    
    // Find a specific like
    Optional<PostLike> findByPostAndUser(Post post, User user);
    
    // Count likes for a post
    Long countByPost(Post post);
    
    // Delete a like
    void deleteByPostAndUser(Post post, User user);
}
