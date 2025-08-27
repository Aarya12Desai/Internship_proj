package com.example.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCommentRequest {
    
    @NotBlank(message = "Comment content cannot be empty")
    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String content;
    
    private Long parentCommentId;
    
    // Constructors
    public CreateCommentRequest() {}
    
    public CreateCommentRequest(String content) {
        this.content = content;
    }
    
    public CreateCommentRequest(String content, Long parentCommentId) {
        this.content = content;
        this.parentCommentId = parentCommentId;
    }
    
    // Getters and Setters
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Long getParentCommentId() {
        return parentCommentId;
    }
    
    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }
}
