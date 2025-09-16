package com.example.auth.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth.model.Project;
import com.example.auth.repository.ProjectRepository;
import com.example.auth.service.AiMatchingService;
import com.example.auth.service.NotificationService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201", "http://localhost:4202"})
public class DirectAiMatchingController {

    @Autowired
    private AiMatchingService aiMatchingService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ProjectRepository projectRepository;

    @PostMapping("/ai-matching")
    public ResponseEntity<?> directAiMatching(@RequestBody Map<String, Object> projectData) {
        try {
            System.out.println("AI Matching request received: " + projectData);
            
            // Get current user info if available
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = auth != null ? auth.getName() : "anonymous";
            
            // Get all projects from database for real matching
            List<Project> allProjects = projectRepository.findAll();
            System.out.println("Found " + allProjects.size() + " projects in database");
            
            // Extract project details from input
            String inputDescription = (String) projectData.get("description");
            
            System.out.println("Input description: " + inputDescription);
            
            // Find matching projects based on domain and technologies
            List<Map<String, Object>> matches = new ArrayList<>();
            
            for (Project project : allProjects) {
                // Skip if it's the same user's project (if user is authenticated)
                if (!currentUsername.equals("anonymous") && 
                    currentUsername.equals(project.getCreatorUsername())) {
                    continue;
                }
                
                // Calculate match score based on description similarity only
                double matchScore = calculateDescriptionMatchScore(
                    inputDescription,
                    project.getDescription()
                );
                
                System.out.println("Project: " + project.getName() + ", Score: " + matchScore + 
                    ", Description: " + project.getDescription().substring(0, Math.min(50, project.getDescription().length())) + "...");
                
                // Only include if match score is above threshold (2% - very lenient for testing)
                if (matchScore >= 2) {
                    Map<String, Object> match = new HashMap<>();
                    match.put("id", project.getId());
                    match.put("title", project.getName());
                    match.put("domain", project.getDomain());
                    match.put("description", project.getDescription());
                    match.put("technologies", project.getTechnologiesUsed());
                    match.put("creator", project.getCreatorUsername());
                    match.put("matchScore", (int) matchScore);
                    match.put("createdAt", project.getCreatedAt());
                    matches.add(match);
                }
            }
            
            // Sort matches by score (descending)
            matches.sort((a, b) -> Integer.compare((Integer) b.get("matchScore"), (Integer) a.get("matchScore")));
            
            // Limit to top 10 matches
            if (matches.size() > 10) {
                matches = matches.subList(0, 10);
            }
            
            System.out.println("Returning " + matches.size() + " matches");
            
            // Return real matches from database
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            System.err.println("AI matching error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "AI matching failed: " + e.getMessage()));
        }
    }
    
    private double calculateMatchScore(String inputDomain, String inputTech, String inputDesc,
                                     String projectDomain, String projectTech, String projectDesc) {
        double score = 0.0;
        
        // Domain matching (40% weight)
        if (inputDomain != null && projectDomain != null) {
            if (inputDomain.equalsIgnoreCase(projectDomain)) {
                score += 40;
            } else if (inputDomain.toLowerCase().contains(projectDomain.toLowerCase()) ||
                      projectDomain.toLowerCase().contains(inputDomain.toLowerCase())) {
                score += 20;
            }
        }
        
        // Technology matching (35% weight)
        if (inputTech != null && projectTech != null) {
            String[] inputTechArray = inputTech.toLowerCase().split("[,\\s]+");
            String[] projectTechArray = projectTech.toLowerCase().split("[,\\s]+");
            
            int commonTech = 0;
            for (String tech1 : inputTechArray) {
                for (String tech2 : projectTechArray) {
                    if (tech1.contains(tech2) || tech2.contains(tech1)) {
                        commonTech++;
                        break;
                    }
                }
            }
            
            if (commonTech > 0) {
                score += (35.0 * commonTech) / Math.max(inputTechArray.length, projectTechArray.length);
            }
        }
        
        // Description similarity (25% weight)
        if (inputDesc != null && projectDesc != null) {
            String[] inputWords = inputDesc.toLowerCase().split("\\s+");
            String[] projectWords = projectDesc.toLowerCase().split("\\s+");
            
            int commonWords = 0;
            for (String word1 : inputWords) {
                if (word1.length() > 3) { // Only consider meaningful words
                    for (String word2 : projectWords) {
                        if (word1.equals(word2)) {
                            commonWords++;
                            break;
                        }
                    }
                }
            }
            
            if (commonWords > 0) {
                score += (25.0 * commonWords) / Math.max(inputWords.length, projectWords.length);
            }
        }
        
        return Math.min(score, 100); // Cap at 100%
    }
    
    private double calculateDescriptionMatchScore(String inputDescription, String projectDescription) {
        if (inputDescription == null || projectDescription == null) {
            return 0.0;
        }
        
        // Convert to lowercase for comparison
        String inputDesc = inputDescription.toLowerCase();
        String projectDesc = projectDescription.toLowerCase();
        
        // Split into words for analysis
        String[] inputWords = inputDesc.split("\\s+");
        String[] projectWords = projectDesc.split("\\s+");
        
        // Calculate word overlap score (70% weight)
        int commonWords = 0;
        for (String inputWord : inputWords) {
            if (inputWord.length() > 2) { // Consider words with 3+ characters (was 4+)
                for (String projectWord : projectWords) {
                    // Exact match
                    if (inputWord.equals(projectWord)) {
                        commonWords++;
                        break;
                    }
                    // Partial match (contains or is contained)
                    else if (inputWord.length() > 4 && projectWord.length() > 4) {
                        if (inputWord.contains(projectWord) || projectWord.contains(inputWord)) {
                            commonWords++;
                            break;
                        }
                    }
                    // Fuzzy match for similar words
                    else if (inputWord.length() > 3 && projectWord.length() > 3) {
                        if (calculateLevenshteinSimilarity(inputWord, projectWord) > 0.75) {
                            commonWords++;
                            break;
                        }
                    }
                }
            }
        }
        
        double wordOverlapScore = 0.0;
        if (commonWords > 0) {
            wordOverlapScore = (70.0 * commonWords) / Math.max(inputWords.length, projectWords.length);
        }
        
        // Calculate phrase/substring similarity (30% weight)
        double phraseScore = 0.0;
        
        // Check for common phrases (3+ word sequences)
        if (inputDesc.length() > 10 && projectDesc.length() > 10) {
            if (projectDesc.contains(inputDesc.substring(0, Math.min(inputDesc.length(), 20))) ||
                inputDesc.contains(projectDesc.substring(0, Math.min(projectDesc.length(), 20)))) {
                phraseScore = 30.0;
            } else {
                // Check for partial phrase matches
                String[] inputPhrases = inputDesc.split("[.!?]");
                String[] projectPhrases = projectDesc.split("[.!?]");
                
                int commonPhrases = 0;
                for (String inputPhrase : inputPhrases) {
                    if (inputPhrase.trim().length() > 10) {
                        for (String projectPhrase : projectPhrases) {
                            if (projectPhrase.trim().length() > 10) {
                                // Check for significant word overlap in phrases
                                String[] iPhraseWords = inputPhrase.trim().split("\\s+");
                                String[] pPhraseWords = projectPhrase.trim().split("\\s+");
                                
                                int phraseCommonWords = 0;
                                for (String iWord : iPhraseWords) {
                                    if (iWord.length() > 3) {
                                        for (String pWord : pPhraseWords) {
                                            if (iWord.equals(pWord)) {
                                                phraseCommonWords++;
                                                break;
                                            }
                                        }
                                    }
                                }
                                
                                if (phraseCommonWords >= 3) { // At least 3 common meaningful words
                                    commonPhrases++;
                                    break;
                                }
                            }
                        }
                    }
                }
                
                if (commonPhrases > 0) {
                    phraseScore = (30.0 * commonPhrases) / Math.max(inputPhrases.length, projectPhrases.length);
                }
            }
        }
        
        double totalScore = wordOverlapScore + phraseScore;
        
        // Boost score for very similar descriptions
        if (inputDesc.length() > 20 && projectDesc.length() > 20) {
            if (calculateLevenshteinSimilarity(inputDesc, projectDesc) > 0.6) {
                totalScore += 10; // 10% bonus for high similarity
            }
        }
        
        return Math.min(totalScore, 100); // Cap at 100%
    }
    
    private double calculateLevenshteinSimilarity(String s1, String s2) {
        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 1.0;
        
        int distance = levenshteinDistance(s1, s2);
        return (double) (maxLen - distance) / maxLen;
    }
    
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1)
                    );
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }
}
