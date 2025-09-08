package com.example.auth.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth.service.AiMatchingService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201", "http://localhost:4202"})
public class DirectAiMatchingController {

    @Autowired
    private AiMatchingService aiMatchingService;

    @PostMapping("/ai-matching")
    public ResponseEntity<?> directAiMatching(@RequestBody Map<String, Object> projectData) {
        try {
            // Create mock matches for now since the service expects different format
            List<Map<String, Object>> matches = new ArrayList<>();
            
            String projectName = (String) projectData.get("name");
            String domain = (String) projectData.get("domain");
            String technologies = (String) projectData.get("technologiesUsed");
            
            // Generate some mock matches based on the input
            Map<String, Object> match1 = new HashMap<>();
            match1.put("title", "Related " + (projectName != null ? projectName : "Project"));
            match1.put("domain", domain != null ? domain : "Technology");
            match1.put("description", "A similar project in the " + (domain != null ? domain : "tech") + " space");
            match1.put("technologies", technologies);
            match1.put("matchScore", 85);
            matches.add(match1);
            
            Map<String, Object> match2 = new HashMap<>();
            match2.put("title", "Innovation Hub Project");
            match2.put("domain", domain != null ? domain : "General");
            match2.put("description", "Collaborative project focusing on innovation");
            match2.put("technologies", "Various technologies");
            match2.put("matchScore", 72);
            matches.add(match2);
            
            Map<String, Object> match3 = new HashMap<>();
            match3.put("title", "Tech Startup Initiative");
            match3.put("domain", "Startup");
            match3.put("description", "Early-stage project looking for collaborators");
            match3.put("technologies", technologies != null ? technologies : "Modern Stack");
            match3.put("matchScore", 68);
            matches.add(match3);
            
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "AI matching failed: " + e.getMessage()));
        }
    }
}
