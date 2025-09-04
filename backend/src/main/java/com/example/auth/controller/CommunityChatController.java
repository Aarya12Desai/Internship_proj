package com.example.auth.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth.model.CommunityChat;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import com.example.auth.repository.CommunityChatRepository;
import com.example.auth.repository.UserRepository;

@RestController
@RequestMapping("/api/community-chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommunityChatController {
    
    @Autowired
    private CommunityChatRepository communityChatRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/messages")
    public ResponseEntity<?> getAllMessages(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            User user = userOpt.get();
            if (user.getRole() != Role.COMPANY) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only companies can access community chat");
            }
            
            List<CommunityChat> messages = communityChatRepository.findTop50ByOrderByCreatedAtDesc();
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching messages");
        }
    }
    
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            User user = userOpt.get();
            if (user.getRole() != Role.COMPANY) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only companies can send messages to community chat");
            }
            
            String messageText = request.get("message");
            if (messageText == null || messageText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message cannot be empty");
            }
            
            CommunityChat chatMessage = new CommunityChat();
            chatMessage.setMessage(messageText.trim());
            chatMessage.setSender(user);
            chatMessage.setSenderId(user.getId());
            chatMessage.setSenderCompanyName(user.getCompanyName());
            chatMessage.setCreatedAt(LocalDateTime.now());
            
            CommunityChat savedMessage = communityChatRepository.save(chatMessage);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending message");
        }
    }
    
    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editMessage(@PathVariable Long id, @RequestBody Map<String, String> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            User user = userOpt.get();
            Optional<CommunityChat> messageOpt = communityChatRepository.findById(id);
            if (messageOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Message not found");
            }
            
            CommunityChat message = messageOpt.get();
            if (!message.getSenderId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own messages");
            }
            
            String newMessageText = request.get("message");
            if (newMessageText == null || newMessageText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message cannot be empty");
            }
            
            message.setMessage(newMessageText.trim());
            message.setEdited(true);
            message.setEditedAt(LocalDateTime.now());
            
            CommunityChat savedMessage = communityChatRepository.save(message);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error editing message");
        }
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            User user = userOpt.get();
            Optional<CommunityChat> messageOpt = communityChatRepository.findById(id);
            if (messageOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Message not found");
            }
            
            CommunityChat message = messageOpt.get();
            if (!message.getSenderId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own messages");
            }
            
            communityChatRepository.delete(message);
            return ResponseEntity.ok("Message deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting message");
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getChatStats(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            User user = userOpt.get();
            if (user.getRole() != Role.COMPANY) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only companies can access community chat");
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMessages", communityChatRepository.count());
            stats.put("recentMessages", communityChatRepository.countMessagesSince(LocalDateTime.now().minusHours(24)));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching chat stats");
        }
    }
}
