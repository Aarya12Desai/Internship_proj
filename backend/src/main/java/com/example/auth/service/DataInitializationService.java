package com.example.auth.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.auth.model.Project;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import com.example.auth.repository.ProjectRepository;
import com.example.auth.repository.UserRepository;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (projectRepository.count() == 0) {
            System.out.println("Initializing sample project data...");
            initializeSampleProjects();
            System.out.println("Sample project data initialized successfully!");
        } else {
            System.out.println("Database already contains projects, skipping initialization.");
        }
    }

    private void initializeSampleProjects() {
        // Create sample users if they don't exist
        List<User> sampleUsers = createSampleUsers();
        
        // Create sample projects
        List<Project> sampleProjects = Arrays.asList(
            createProject(
                "E-Learning Platform",
                "A comprehensive online learning management system built with React and Spring Boot. Features include course creation, video streaming, interactive quizzes, progress tracking, and student-teacher communication. The platform supports multiple file formats, real-time chat, and mobile-responsive design for seamless learning experience.",
                "React, Spring Boot, MySQL, JWT, WebRTC, AWS S3",
                "Education",
                sampleUsers.get(0)
            ),
            createProject(
                "Healthcare Management System",
                "Digital healthcare solution for hospitals and clinics to manage patient records, appointments, and medical history. Includes features for prescription management, billing, insurance claims, and telemedicine consultations. Built with security-first approach complying with HIPAA regulations.",
                "Angular, Node.js, MongoDB, Socket.io, Stripe API",
                "Healthcare",
                sampleUsers.get(1)
            ),
            createProject(
                "Smart Agriculture IoT",
                "IoT-based precision farming solution that monitors soil moisture, temperature, humidity, and crop health using sensors and drones. Provides real-time data analytics, automated irrigation control, and predictive analytics for crop yield optimization. Includes mobile app for farmers.",
                "Python, Django, PostgreSQL, TensorFlow, IoT Sensors, React Native",
                "Agriculture",
                sampleUsers.get(0)
            ),
            createProject(
                "FinTech Mobile Banking",
                "Secure mobile banking application with features like account management, money transfers, bill payments, investment tracking, and cryptocurrency trading. Implements biometric authentication, fraud detection, and real-time transaction monitoring.",
                "React Native, Express.js, PostgreSQL, Redis, Blockchain, ML Models",
                "Finance",
                sampleUsers.get(2)
            ),
            createProject(
                "AI-Powered Chatbot",
                "Intelligent customer service chatbot using natural language processing and machine learning. Capable of handling customer queries, product recommendations, order tracking, and escalating complex issues to human agents. Integrates with multiple business systems and supports multiple languages.",
                "Python, TensorFlow, NLP, FastAPI, Redis, Docker",
                "Artificial Intelligence",
                sampleUsers.get(1)
            ),
            createProject(
                "Social Media Analytics Dashboard",
                "Real-time social media monitoring and analytics platform that tracks brand mentions, sentiment analysis, competitor analysis, and engagement metrics across multiple platforms. Provides automated reporting and actionable insights for marketing teams.",
                "Vue.js, Python, Apache Kafka, Elasticsearch, D3.js, Docker",
                "Marketing",
                sampleUsers.get(0)
            ),
            createProject(
                "Supply Chain Management",
                "End-to-end supply chain visibility platform that tracks inventory, shipments, and supplier performance. Features include demand forecasting, route optimization, warehouse management, and blockchain-based provenance tracking for transparency.",
                "Java Spring, React, MySQL, Apache Kafka, Blockchain, Maps API",
                "Logistics",
                sampleUsers.get(2)
            ),
            createProject(
                "Virtual Reality Training Simulator",
                "Immersive VR training platform for industrial safety, medical procedures, and technical skills. Provides realistic simulations, performance tracking, and certification management. Supports multiple VR headsets and includes content creation tools for trainers.",
                "Unity 3D, C#, WebXR, Node.js, MongoDB, Cloud Computing",
                "Virtual Reality",
                sampleUsers.get(1)
            ),
            createProject(
                "Climate Data Visualization",
                "Interactive web platform for visualizing climate change data, weather patterns, and environmental trends. Processes satellite imagery, weather station data, and predictive models to create compelling visualizations for researchers and policymakers.",
                "Python, Flask, D3.js, PostgreSQL, Mapbox, AWS, Machine Learning",
                "Environment",
                sampleUsers.get(0)
            ),
            createProject(
                "Cybersecurity Threat Detection",
                "Advanced security monitoring system that uses machine learning to detect anomalous network behavior, potential cyber threats, and security vulnerabilities. Includes real-time alerts, forensic analysis tools, and automated response capabilities.",
                "Python, TensorFlow, Elasticsearch, Kibana, Docker, Security APIs",
                "Cybersecurity",
                sampleUsers.get(2)
            ),
            createProject(
                "Food Delivery Optimization",
                "Smart food delivery platform that optimizes delivery routes, predicts demand, and manages restaurant partnerships. Features include real-time tracking, dynamic pricing, customer preferences learning, and sustainability metrics to reduce carbon footprint.",
                "React, Node.js, MongoDB, Redis, Google Maps API, Machine Learning",
                "Food Technology",
                sampleUsers.get(1)
            ),
            createProject(
                "Blockchain Voting System",
                "Secure and transparent voting platform using blockchain technology to ensure election integrity. Features voter authentication, encrypted ballot casting, real-time result tracking, and audit trails. Designed for various voting scenarios from corporate to municipal elections.",
                "Solidity, Web3.js, React, IPFS, Ethereum, Node.js",
                "Blockchain",
                sampleUsers.get(0)
            ),
            createProject(
                "Fitness Tracking App",
                "Comprehensive fitness and wellness mobile application that tracks workouts, nutrition, sleep patterns, and health metrics. Includes AI-powered personal training recommendations, social features for motivation, and integration with wearable devices.",
                "Flutter, Firebase, Python, TensorFlow, Health APIs, Cloud Functions",
                "Health & Fitness",
                sampleUsers.get(2)
            ),
            createProject(
                "Smart Home Automation",
                "Integrated home automation system that controls lighting, security, temperature, and appliances through voice commands and mobile app. Uses IoT devices, machine learning for usage pattern recognition, and energy optimization algorithms.",
                "Python, Raspberry Pi, Arduino, MQTT, React Native, AWS IoT",
                "Internet of Things",
                sampleUsers.get(1)
            ),
            createProject(
                "Online Marketplace Platform",
                "Multi-vendor e-commerce platform with features like product catalog management, secure payments, order fulfillment, seller analytics, and customer reviews. Includes recommendation engine, fraud detection, and mobile commerce capabilities.",
                "Django, PostgreSQL, Redis, Elasticsearch, Stripe, React, Docker",
                "E-commerce",
                sampleUsers.get(0)
            )
        );

        // Save all projects
        projectRepository.saveAll(sampleProjects);
    }

    private List<User> createSampleUsers() {
        // Create sample users if they don't exist
        User user1 = userRepository.findByUsername("demo_student1")
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername("demo_student1");
                newUser.setEmail("demo.student1@example.com");
                newUser.setPassword(passwordEncoder.encode("password123"));
                newUser.setRole(Role.USER);
                newUser.setStudentFirstName("Alex");
                newUser.setStudentLastName("Johnson");
                newUser.setStudentRollNumber("CS2021001");
                return userRepository.save(newUser);
            });

        User user2 = userRepository.findByUsername("demo_student2")
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername("demo_student2");
                newUser.setEmail("demo.student2@example.com");
                newUser.setPassword(passwordEncoder.encode("password123"));
                newUser.setRole(Role.USER);
                newUser.setStudentFirstName("Maria");
                newUser.setStudentLastName("Garcia");
                newUser.setStudentRollNumber("CS2021002");
                return userRepository.save(newUser);
            });

        User user3 = userRepository.findByUsername("demo_student3")
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername("demo_student3");
                newUser.setEmail("demo.student3@example.com");
                newUser.setPassword(passwordEncoder.encode("password123"));
                newUser.setRole(Role.USER);
                newUser.setStudentFirstName("David");
                newUser.setStudentLastName("Chen");
                newUser.setStudentRollNumber("CS2021003");
                return userRepository.save(newUser);
            });

        return Arrays.asList(user1, user2, user3);
    }

    private Project createProject(String name, String description, String technologies, String domain, User creator) {
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setTechnologiesUsed(technologies);
        project.setDomain(domain);
        project.setCreator(creator);
        project.setCreatorUsername(creator.getUsername());
        project.setUserId(creator.getId());
        project.setCreatedAt(Instant.now());
        return project;
    }
}
