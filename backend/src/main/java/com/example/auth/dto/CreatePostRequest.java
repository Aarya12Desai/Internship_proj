package com.example.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreatePostRequest {
    
    @NotBlank(message = "Post content cannot be empty")
    @Size(max = 1000, message = "Post content cannot exceed 1000 characters")
    private String content;
    
    private String imageUrl;
    
    // Constructors
    public CreatePostRequest() {}
    
    public CreatePostRequest(String content) {
        this.content = content;
    }
    
    public CreatePostRequest(String content, String imageUrl) {
        this.content = content;
        this.imageUrl = imageUrl;
    }
    
    // Getters and Setters
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
}
