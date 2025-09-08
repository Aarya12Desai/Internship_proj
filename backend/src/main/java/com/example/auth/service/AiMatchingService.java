package com.example.auth.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.auth.repository.ProjectRepository;
import com.example.auth.repository.UserRepository;

@Service
public class AiMatchingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public Map<String, Object> findMatches(Map<String, Object> projectData) {
        // Simulate AI matching logic without saving to database
        List<Map<String, Object>> matches = new ArrayList<>();

        String title = (String) projectData.get("title");
        String projectType = (String) projectData.get("projectType");
        String industryDomain = (String) projectData.get("industryDomain");
        String technologiesUsed = (String) projectData.get("technologiesUsed");
        String description = (String) projectData.get("description");

        // Generate mock company matches based on project data
        matches.addAll(generateCompanyMatches(projectType, industryDomain, technologiesUsed));
        
        // Generate mock startup matches
        matches.addAll(generateStartupMatches(projectType, industryDomain));
        
        // Generate mock incubator matches
        matches.addAll(generateIncubatorMatches(industryDomain));

        // Sort by match score (descending)
        matches.sort((a, b) -> Integer.compare((Integer) b.get("matchScore"), (Integer) a.get("matchScore")));

        Map<String, Object> result = new HashMap<>();
        result.put("matches", matches);
        result.put("totalMatches", matches.size());
        result.put("searchQuery", projectData);
        
        return result;
    }

    public Map<String, Object> findCompanyMatches(Map<String, Object> projectData) {
        List<Map<String, Object>> companyMatches = new ArrayList<>();
        
        String industryDomain = (String) projectData.get("industryDomain");
        String technologiesUsed = (String) projectData.get("technologiesUsed");
        
        companyMatches.addAll(generateCompanyMatches(
            (String) projectData.get("projectType"), 
            industryDomain, 
            technologiesUsed
        ));

        Map<String, Object> result = new HashMap<>();
        result.put("companies", companyMatches);
        result.put("totalCompanies", companyMatches.size());
        
        return result;
    }

    public Map<String, Object> findDeveloperMatches(Map<String, Object> projectData) {
        List<Map<String, Object>> developerMatches = new ArrayList<>();
        
        String technologiesUsed = (String) projectData.get("technologiesUsed");
        String projectType = (String) projectData.get("projectType");
        
        developerMatches.addAll(generateDeveloperMatches(technologiesUsed, projectType));

        Map<String, Object> result = new HashMap<>();
        result.put("developers", developerMatches);
        result.put("totalDevelopers", developerMatches.size());
        
        return result;
    }

    public Map<String, Object> suggestImprovements(Map<String, Object> projectData) {
        List<Map<String, Object>> suggestions = new ArrayList<>();
        
        String projectType = (String) projectData.get("projectType");
        String technologiesUsed = (String) projectData.get("technologiesUsed");
        String industryDomain = (String) projectData.get("industryDomain");
        
        suggestions.addAll(generateImprovementSuggestions(projectType, technologiesUsed, industryDomain));

        Map<String, Object> result = new HashMap<>();
        result.put("suggestions", suggestions);
        result.put("totalSuggestions", suggestions.size());
        
        return result;
    }

    private List<Map<String, Object>> generateCompanyMatches(String projectType, String industryDomain, String technologiesUsed) {
        List<Map<String, Object>> companies = new ArrayList<>();
        
        // Mock company data based on industry domain
        Map<String, List<String>> industryCompanies = Map.of(
            "Healthcare", Arrays.asList("MedTech Solutions", "HealthCare Innovations", "BioTech Labs"),
            "FinTech", Arrays.asList("FinanceFlow Corp", "CryptoTech Solutions", "PaymentPro Systems"),
            "Education", Arrays.asList("EduTech Innovations", "LearningSoft", "KnowledgeHub"),
            "E-commerce", Arrays.asList("ShopTech Solutions", "E-Commerce Masters", "RetailFlow"),
            "Entertainment", Arrays.asList("MediaTech Studios", "EntertainmentFlow", "GameDev Pro"),
            "Other", Arrays.asList("TechCorp Solutions", "InnovateLabs", "FutureTech")
        );

        List<String> companyNames = industryCompanies.getOrDefault(industryDomain, industryCompanies.get("Other"));
        
        for (int i = 0; i < Math.min(3, companyNames.size()); i++) {
            Map<String, Object> company = new HashMap<>();
            company.put("id", i + 1);
            company.put("name", companyNames.get(i));
            company.put("type", "Company");
            company.put("industry", industryDomain);
            company.put("description", "Leading " + industryDomain.toLowerCase() + " company specializing in innovative solutions");
            company.put("technologies", technologiesUsed);
            company.put("matchScore", 85 + new Random().nextInt(15)); // 85-99%
            company.put("location", "Global");
            company.put("size", "50-200 employees");
            companies.add(company);
        }
        
        return companies;
    }

    private List<Map<String, Object>> generateStartupMatches(String projectType, String industryDomain) {
        List<Map<String, Object>> startups = new ArrayList<>();
        
        String[] startupNames = {"StartupX Ventures", "InnovatePlus", "TechLaunch", "NextGen Solutions"};
        
        for (int i = 0; i < 2; i++) {
            Map<String, Object> startup = new HashMap<>();
            startup.put("id", i + 10);
            startup.put("name", startupNames[i]);
            startup.put("type", "Startup");
            startup.put("industry", industryDomain);
            startup.put("description", "Fast-growing startup focusing on " + projectType.toLowerCase() + " development");
            startup.put("technologies", "Modern Tech Stack");
            startup.put("matchScore", 70 + new Random().nextInt(15)); // 70-84%
            startup.put("location", "Tech Hub");
            startup.put("size", "10-50 employees");
            startups.add(startup);
        }
        
        return startups;
    }

    private List<Map<String, Object>> generateIncubatorMatches(String industryDomain) {
        List<Map<String, Object>> incubators = new ArrayList<>();
        
        Map<String, Object> incubator = new HashMap<>();
        incubator.put("id", 20);
        incubator.put("name", "InnovateHub");
        incubator.put("type", "Incubator");
        incubator.put("industry", "Technology");
        incubator.put("description", "Technology incubator supporting emerging projects in " + industryDomain.toLowerCase());
        incubator.put("technologies", "Various");
        incubator.put("matchScore", 60 + new Random().nextInt(15)); // 60-74%
        incubator.put("location", "Innovation District");
        incubator.put("size", "Network of 100+ companies");
        incubators.add(incubator);
        
        return incubators;
    }

    private List<Map<String, Object>> generateDeveloperMatches(String technologiesUsed, String projectType) {
        List<Map<String, Object>> developers = new ArrayList<>();
        
        String[] developerNames = {"Alex Smith", "Maria Garcia", "John Chen", "Sarah Johnson"};
        String[] skills = {"Full Stack Developer", "Frontend Specialist", "Backend Expert", "DevOps Engineer"};
        
        for (int i = 0; i < 3; i++) {
            Map<String, Object> developer = new HashMap<>();
            developer.put("id", i + 30);
            developer.put("name", developerNames[i]);
            developer.put("type", "Developer");
            developer.put("skill", skills[i]);
            developer.put("description", skills[i] + " with expertise in " + technologiesUsed);
            developer.put("technologies", technologiesUsed);
            developer.put("matchScore", 75 + new Random().nextInt(20)); // 75-94%
            developer.put("experience", (3 + i) + "+ years");
            developer.put("availability", "Available for collaboration");
            developers.add(developer);
        }
        
        return developers;
    }

    private List<Map<String, Object>> generateImprovementSuggestions(String projectType, String technologiesUsed, String industryDomain) {
        List<Map<String, Object>> suggestions = new ArrayList<>();
        
        // Technology suggestions
        Map<String, Object> techSuggestion = new HashMap<>();
        techSuggestion.put("id", 1);
        techSuggestion.put("category", "Technology Enhancement");
        techSuggestion.put("title", "Consider Modern Frameworks");
        techSuggestion.put("description", "Based on your " + projectType + ", consider integrating cloud-native technologies");
        techSuggestion.put("priority", "High");
        techSuggestion.put("impact", "Performance & Scalability");
        suggestions.add(techSuggestion);

        // Market positioning suggestion
        Map<String, Object> marketSuggestion = new HashMap<>();
        marketSuggestion.put("id", 2);
        marketSuggestion.put("category", "Market Positioning");
        marketSuggestion.put("title", "Industry-Specific Features");
        marketSuggestion.put("description", "For " + industryDomain + " domain, consider adding compliance and security features");
        marketSuggestion.put("priority", "Medium");
        marketSuggestion.put("impact", "Market Readiness");
        suggestions.add(marketSuggestion);

        // Collaboration suggestion
        Map<String, Object> collabSuggestion = new HashMap<>();
        collabSuggestion.put("id", 3);
        collabSuggestion.put("category", "Collaboration");
        collabSuggestion.put("title", "Partnership Opportunities");
        collabSuggestion.put("description", "Your project could benefit from partnerships with companies in the " + industryDomain + " sector");
        collabSuggestion.put("priority", "Medium");
        collabSuggestion.put("impact", "Business Growth");
        suggestions.add(collabSuggestion);
        
        return suggestions;
    }
}
