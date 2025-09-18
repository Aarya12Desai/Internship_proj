package com.example.auth.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth.model.Notification;
import com.example.auth.model.Project;
import com.example.auth.model.User;
import com.example.auth.repository.ProjectRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.service.NotificationService;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201", "http://localhost:4202"})
public class ContactController {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    @PostMapping("/project")
    public ResponseEntity<?> contactProjectCreator(@RequestBody Map<String, Object> payload, Authentication authentication) {
        try {
            // Get the contacting user (sender)
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String senderUsername = userDetails.getUsername();
            
            Optional<User> senderOpt = userRepository.findByUsername(senderUsername);
            if (senderOpt.isEmpty()) {
                senderOpt = userRepository.findByEmail(senderUsername);
            }
            
            if (senderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Sender user not found"));
            }
            
            User sender = senderOpt.get();
            
            // Extract project ID and message details
            Long projectId = null;
            if (payload.get("projectId") instanceof Integer) {
                projectId = ((Integer) payload.get("projectId")).longValue();
            } else if (payload.get("projectId") instanceof Long) {
                projectId = (Long) payload.get("projectId");
            } else if (payload.get("projectId") instanceof String) {
                try {
                    projectId = Long.parseLong((String) payload.get("projectId"));
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid project ID format"));
                }
            }
            
            String title = (String) payload.get("title");
            String message = (String) payload.get("message");
            String type = (String) payload.get("type");
            
            if (projectId == null || title == null || message == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields: projectId, title, message"));
            }
            
            // Find the project and its creator
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Project not found"));
            }
            
            Project project = projectOpt.get();
            Long creatorUserId = project.getUserId();
            
            if (creatorUserId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Project creator information not available"));
            }
            
            // Check if sender is trying to contact themselves
            if (sender.getId().equals(creatorUserId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "You cannot contact yourself about your own project"));
            }
            
            // Enhance message with sender information
            String enhancedMessage = String.format("%s\n\n--- From: %s (%s) ---", 
                message, 
                sender.getUsername(),
                sender.getRole().name()
            );
            
            // Create notification for the project creator
            Notification notification = notificationService.createCompanyConnectionNotification(
                creatorUserId, 
                title, 
                enhancedMessage, 
                type != null ? type : "project_contact", 
                sender.getId()
            );
            
            if (notification == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create notification"));
            }
            
            System.out.println("=== PROJECT CONTACT NOTIFICATION ===");
            System.out.println("Sender: " + sender.getUsername() + " (" + sender.getRole() + ")");
            System.out.println("Project: " + project.getName());
            System.out.println("Creator User ID: " + creatorUserId);
            System.out.println("Message: " + message);
            System.out.println("Notification ID: " + notification.getId());
            System.out.println("=====================================");
            
            return ResponseEntity.ok(Map.of(
                "message", "Contact message sent successfully",
                "projectTitle", project.getName(),
                "creatorNotified", true
            ));
            
        } catch (Exception e) {
            System.err.println("Error in project contact: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }
}