package com.example.auth.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.auth.dto.CommentResponse;
import com.example.auth.dto.CreateCommentRequest;
import com.example.auth.dto.CreatePostRequest;
import com.example.auth.dto.PostResponse;
import com.example.auth.exception.UserNotFoundException;
import com.example.auth.model.Comment;
import com.example.auth.model.CommentStatus;
import com.example.auth.model.Post;
import com.example.auth.model.PostLike;
import com.example.auth.model.PostStatus;
import com.example.auth.model.User;
import com.example.auth.repository.CommentRepository;
import com.example.auth.repository.PostLikeRepository;
import com.example.auth.repository.PostRepository;
import com.example.auth.repository.UserRepository;

@Service
@Transactional
public class PostService {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private PostLikeRepository postLikeRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create a new post
    public PostResponse createPost(CreatePostRequest request, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Post post = new Post(request.getContent(), request.getImageUrl(), user);
        post = postRepository.save(post);
        
        return convertToPostResponse(post, user);
    }
    
    // Get all posts (feed) with pagination
    public Page<PostResponse> getAllPosts(int page, int size, String username) {
        User currentUser = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE, pageable);
        
        return posts.map(post -> convertToPostResponse(post, currentUser));
    }
    
    // Get posts by user
    public Page<PostResponse> getUserPosts(Long userId, int page, int size, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new UserNotFoundException("Current user not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByAuthorAndStatusOrderByCreatedAtDesc(user, PostStatus.ACTIVE, pageable);
        
        return posts.map(post -> convertToPostResponse(post, currentUser));
    }
    
    // Get a specific post
    public PostResponse getPost(Long postId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Post post = postRepository.findByIdAndStatus(postId, PostStatus.ACTIVE)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return convertToPostResponse(post, user);
    }
    
    // Like/Unlike a post
    public PostResponse toggleLike(Long postId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Post post = postRepository.findByIdAndStatus(postId, PostStatus.ACTIVE)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        boolean isLiked = postLikeRepository.existsByPostAndUser(post, user);
        
        if (isLiked) {
            // Unlike the post
            postLikeRepository.deleteByPostAndUser(post, user);
            post.decrementLikesCount();
        } else {
            // Like the post
            PostLike like = new PostLike(post, user);
            postLikeRepository.save(like);
            post.incrementLikesCount();
        }
        
        post = postRepository.save(post);
        return convertToPostResponse(post, user);
    }
    
    // Delete a post
    public void deletePost(Long postId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Post post = postRepository.findByIdAndStatus(postId, PostStatus.ACTIVE)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own posts");
        }
        
        post.setStatus(PostStatus.DELETED);
        postRepository.save(post);
    }
    
    // Add a comment to a post
    public CommentResponse addComment(Long postId, CreateCommentRequest request, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Post post = postRepository.findByIdAndStatus(postId, PostStatus.ACTIVE)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment(request.getContent(), post, user);
        
        // Handle parent comment if it's a reply
        if (request.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(request.getParentCommentId())
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parentComment);
        }
        
        comment = commentRepository.save(comment);
        
        // Update post comments count
        post.incrementCommentsCount();
        postRepository.save(post);
        
        return convertToCommentResponse(comment);
    }
    
    // Get comments for a post
    public List<CommentResponse> getComments(Long postId) {
        Post post = postRepository.findByIdAndStatus(postId, PostStatus.ACTIVE)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        List<Comment> comments = commentRepository.findByPostAndStatusAndParentCommentIsNullOrderByCreatedAtAsc(post, CommentStatus.ACTIVE);
        
        return comments.stream()
            .map(this::convertToCommentResponse)
            .collect(Collectors.toList());
    }
    
    // Search posts
    public Page<PostResponse> searchPosts(String keyword, int page, int size, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.searchByContent(keyword, PostStatus.ACTIVE, pageable);
        
        return posts.map(post -> convertToPostResponse(post, user));
    }
    
    // Get trending posts
    public Page<PostResponse> getTrendingPosts(int page, int size, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findTrendingPosts(PostStatus.ACTIVE, pageable);
        
        return posts.map(post -> convertToPostResponse(post, user));
    }
    
    // Helper method to convert Post to PostResponse
    private PostResponse convertToPostResponse(Post post, User currentUser) {
        boolean isLiked = postLikeRepository.existsByPostAndUser(post, currentUser);
        
        return new PostResponse(
            post.getId(),
            post.getContent(),
            post.getImageUrl(),
            post.getAuthor().getId(),
            post.getAuthor().getUsername(),
            post.getAuthor().getEmail(),
            post.getLikesCount(),
            post.getCommentsCount(),
            post.getSharesCount(),
            isLiked,
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getStatus().name()
        );
    }
    
    // Helper method to convert Comment to CommentResponse
    private CommentResponse convertToCommentResponse(Comment comment) {
        return new CommentResponse(
            comment.getId(),
            comment.getContent(),
            comment.getPost().getId(),
            comment.getAuthor().getId(),
            comment.getAuthor().getUsername(),
            comment.getAuthor().getEmail(),
            comment.getParentComment() != null ? comment.getParentComment().getId() : null,
            comment.getLikesCount(),
            comment.getCreatedAt(),
            comment.getUpdatedAt()
        );
    }
}
