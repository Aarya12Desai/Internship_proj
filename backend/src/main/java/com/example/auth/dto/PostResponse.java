package com.example.auth.dto;

import java.time.LocalDateTime;

public class PostResponse {
    
    private Long id;
    private String content;
    private String imageUrl;
    private Long authorId;
    private String authorUsername;
    private String authorEmail;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer sharesCount;
    private boolean isLikedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    
    // Constructors
    public PostResponse() {}
    
    public PostResponse(Long id, String content, String imageUrl, Long authorId, 
                       String authorUsername, String authorEmail, Integer likesCount, 
                       Integer commentsCount, Integer sharesCount, boolean isLikedByCurrentUser,
                       LocalDateTime createdAt, LocalDateTime updatedAt, String status) {
        this.id = id;
        this.content = content;
        this.imageUrl = imageUrl;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.authorEmail = authorEmail;
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
        this.sharesCount = sharesCount;
        this.isLikedByCurrentUser = isLikedByCurrentUser;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public Long getAuthorId() {
        return authorId;
    }
    
    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }
    
    public String getAuthorUsername() {
        return authorUsername;
    }
    
    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }
    
    public String getAuthorEmail() {
        return authorEmail;
    }
    
    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }
    
    public Integer getLikesCount() {
        return likesCount;
    }
    
    public void setLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }
    
    public Integer getCommentsCount() {
        return commentsCount;
    }
    
    public void setCommentsCount(Integer commentsCount) {
        this.commentsCount = commentsCount;
    }
    
    public Integer getSharesCount() {
        return sharesCount;
    }
    
    public void setSharesCount(Integer sharesCount) {
        this.sharesCount = sharesCount;
    }
    
    public boolean isLikedByCurrentUser() {
        return isLikedByCurrentUser;
    }
    
    public void setLikedByCurrentUser(boolean likedByCurrentUser) {
        isLikedByCurrentUser = likedByCurrentUser;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
