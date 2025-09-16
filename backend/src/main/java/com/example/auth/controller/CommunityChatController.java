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

import com.example.auth.model.Community;
import com.example.auth.model.CommunityChat;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import com.example.auth.repository.CommunityChatRepository;
import com.example.auth.repository.CommunityMembershipRepository;
import com.example.auth.repository.CommunityRepository;
import com.example.auth.repository.UserRepository;

@RestController
@RequestMapping("/api/community-chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommunityChatController {
    
    @Autowired
    private CommunityChatRepository communityChatRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommunityRepository communityRepository;
    
    @Autowired
    private CommunityMembershipRepository membershipRepository;
    
    @GetMapping("/{communityId}/messages")
    public ResponseEntity<?> getCommunityMessages(@PathVariable Long communityId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            System.out.println("Community Chat - Getting messages for community " + communityId + " and user: " + username);
            
            // Try to find user by username first, then by email
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(username);
            }
            
            if (userOpt.isEmpty()) {
                System.out.println("Community Chat - User not found: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            System.out.println("Community Chat - Found user: " + user.getUsername() + ", Role: " + user.getRole());
            
            // Allow all users to view messages in the global chat (communityId == 0)
            if (communityId != 0) {
                boolean isMember = membershipRepository.existsByUserIdAndCommunityIdAndIsActiveTrue(user.getId(), communityId);
                Optional<Community> communityOpt = communityRepository.findById(communityId);
                if (user.getRole() == Role.COMPANY && communityOpt.isPresent()) {
                    Community community = communityOpt.get();
                    if (community.getCompanyId() != null && community.getCompanyId().equals(user.getId())) {
                        // Upsert membership: find or create and activate
                        Optional<com.example.auth.model.CommunityMembership> existingMembershipOpt = membershipRepository.findByUserIdAndCommunityId(user.getId(), community.getId());
                        com.example.auth.model.CommunityMembership membership;
                        if (existingMembershipOpt.isPresent()) {
                            membership = existingMembershipOpt.get();
                            membership.setActive(true);
                            membership.setRole(com.example.auth.model.MembershipRole.ADMIN);
                            System.out.println("Community Chat - Reactivated existing membership for company owner: " + user.getUsername());
                        } else {
                            membership = new com.example.auth.model.CommunityMembership();
                            membership.setUser(user);
                            membership.setUserId(user.getId());
                            membership.setUsername(user.getUsername());
                            membership.setCommunity(community);
                            membership.setCommunityId(community.getId());
                            membership.setRole(com.example.auth.model.MembershipRole.ADMIN);
                            membership.setActive(true);
                            System.out.println("Community Chat - Created new membership for company owner: " + user.getUsername());
                        }
                        membershipRepository.save(membership);
                        // After upsert, always allow company owner to fetch messages
                        List<CommunityChat> messages = communityChatRepository.findTop50ByCommunityIdOrderByCreatedAtDesc(communityId);
                        System.out.println("Community Chat - Retrieved " + messages.size() + " messages for community " + communityId);
                        return ResponseEntity.ok(messages);
                    }
                }
                if (!isMember) {
                    System.out.println("Community Chat - Access denied for user: " + user.getUsername() + " in community: " + communityId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You must be a member of this community to view messages"));
                }
            }
            
            List<CommunityChat> messages;
            if (communityId == 0) {
                // For global chat, show all messages (or you can limit to a higher number if needed)
                messages = communityChatRepository.findByCommunityIdOrderByCreatedAtDesc(0L);
                System.out.println("Community Chat - Using global chat query for communityId 0");
            } else {
                messages = communityChatRepository.findTop50ByCommunityIdOrderByCreatedAtDesc(communityId);
                System.out.println("Community Chat - Using regular chat query for communityId " + communityId);
            }
            System.out.println("Community Chat - Retrieved " + messages.size() + " messages for community " + communityId);
            
            // Debug: Let's also check the total count in the database for this community
            try {
                List<CommunityChat> allMessages = communityChatRepository.findAll();
                long communityMessages = allMessages.stream().filter(m -> m.getCommunityId() != null && m.getCommunityId().equals(communityId)).count();
                System.out.println("Community Chat - Debug: Total messages in DB: " + allMessages.size() + ", Messages for community " + communityId + ": " + communityMessages);
                
                // Print some message details
                for (CommunityChat msg : allMessages) {
                    if (msg.getCommunityId() != null && msg.getCommunityId().equals(communityId)) {
                        System.out.println("Community Chat - Debug message: ID=" + msg.getId() + ", communityId=" + msg.getCommunityId() + ", message=" + msg.getMessage() + ", sender=" + msg.getSenderCompanyName());
                    }
                }
            } catch (Exception debugEx) {
                System.err.println("Community Chat - Debug error: " + debugEx.getMessage());
            }
            
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Community Chat - Error fetching messages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error fetching messages"));
        }
    }
    
    @PostMapping("/{communityId}/send")
    public ResponseEntity<?> sendMessage(@PathVariable Long communityId, @RequestBody Map<String, String> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            System.out.println("Community Chat - Sending message to community " + communityId + " for user: " + username);
            
            // Try to find user by username first, then by email
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(username);
            }
            
            if (userOpt.isEmpty()) {
                System.out.println("Community Chat - User not found: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            System.out.println("Community Chat - Found user: " + user.getUsername() + ", Role: " + user.getRole());
            
            // Allow all users to send messages in the global chat (communityId == 0)
            if (communityId != 0) {
                boolean isMember = membershipRepository.existsByUserIdAndCommunityIdAndIsActiveTrue(user.getId(), communityId);
                Optional<Community> communityOpt = communityRepository.findById(communityId);
                if (user.getRole() == Role.COMPANY && communityOpt.isPresent()) {
                    Community community = communityOpt.get();
                    if (community.getCompanyId() != null && community.getCompanyId().equals(user.getId())) {
                        // Upsert membership: find or create and activate
                        Optional<com.example.auth.model.CommunityMembership> existingMembershipOpt = membershipRepository.findByUserIdAndCommunityId(user.getId(), community.getId());
                        com.example.auth.model.CommunityMembership membership;
                        if (existingMembershipOpt.isPresent()) {
                            membership = existingMembershipOpt.get();
                            membership.setActive(true);
                            membership.setRole(com.example.auth.model.MembershipRole.ADMIN);
                        } else {
                            membership = new com.example.auth.model.CommunityMembership();
                            membership.setUser(user);
                            membership.setUserId(user.getId());
                            membership.setUsername(user.getUsername());
                            membership.setCommunity(community);
                            membership.setCommunityId(community.getId());
                            membership.setRole(com.example.auth.model.MembershipRole.ADMIN);
                            membership.setActive(true);
                        }
                        membershipRepository.save(membership);
                        isMember = true;
                    }
                }
                if (!isMember) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You must be a member of this community to send messages"));
                }
            }
            
            String messageText = request.get("message");
            if (messageText == null || messageText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
            }

            CommunityChat chatMessage = new CommunityChat();
            chatMessage.setMessage(messageText.trim());
            chatMessage.setSender(user);
            chatMessage.setSenderId(user.getId());
            chatMessage.setSenderCompanyName(user.getRole() == Role.COMPANY ? user.getCompanyName() : user.getUsername());
            chatMessage.setCommunityId(communityId);
            chatMessage.setCreatedAt(LocalDateTime.now());

            if (communityId == 0) {
                chatMessage.setCommunityName("Global");
            } else {
                // Get community details
                Optional<Community> communityOpt = communityRepository.findById(communityId);
                if (communityOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Community not found"));
                }
                Community community = communityOpt.get();
                chatMessage.setCommunity(community);
                chatMessage.setCommunityName(community.getName());
            }

            CommunityChat savedMessage = communityChatRepository.save(chatMessage);
            System.out.println("Community Chat - Message saved with ID: " + savedMessage.getId() + " in communityId " + communityId);

            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            System.err.println("Community Chat - Error sending message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error sending message"));
        }
    }
    
    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editMessage(@PathVariable Long id, @RequestBody Map<String, String> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            // Try to find user by username first, then by email
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(username);
            }
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            Optional<CommunityChat> messageOpt = communityChatRepository.findById(id);
            if (messageOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Message not found"));
            }
            
            CommunityChat message = messageOpt.get();
            if (!message.getSenderId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only edit your own messages"));
            }
            
            String newMessageText = request.get("message");
            if (newMessageText == null || newMessageText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
            }
            
            message.setMessage(newMessageText.trim());
            message.setEdited(true);
            message.setEditedAt(LocalDateTime.now());
            
            CommunityChat savedMessage = communityChatRepository.save(message);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error editing message"));
        }
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            // Try to find user by username first, then by email
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(username);
            }
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            Optional<CommunityChat> messageOpt = communityChatRepository.findById(id);
            if (messageOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Message not found"));
            }
            
            CommunityChat message = messageOpt.get();
            if (!message.getSenderId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only delete your own messages"));
            }
            
            communityChatRepository.delete(message);
            return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error deleting message"));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getChatStats(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            // Try to find user by username first, then by email
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(username);
            }
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            if (user.getRole() != Role.COMPANY) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only companies can access community chat"));
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMessages", communityChatRepository.count());
            stats.put("recentMessages", communityChatRepository.countMessagesSince(LocalDateTime.now().minusHours(24)));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error fetching chat stats"));
        }
    }
    
    @PostMapping("/test-message")
    public ResponseEntity<?> createTestMessage(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            // Try to find user by username first, then by email
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(username);
            }
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            if (user.getRole() != Role.COMPANY) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only companies can create test messages"));
            }
            
            // Create a test message
            CommunityChat testMessage = new CommunityChat();
            testMessage.setMessage("Welcome to the community chat! This is a test message from " + user.getCompanyName());
            testMessage.setSender(user);
            testMessage.setSenderId(user.getId());
            testMessage.setSenderCompanyName(user.getCompanyName());
            testMessage.setCreatedAt(LocalDateTime.now());
            
            CommunityChat savedMessage = communityChatRepository.save(testMessage);
            System.out.println("Community Chat - Test message created with ID: " + savedMessage.getId());
            
            return ResponseEntity.ok(Map.of("message", "Test message created successfully", "messageId", savedMessage.getId()));
        } catch (Exception e) {
            System.err.println("Community Chat - Error creating test message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error creating test message"));
        }
    }
}
