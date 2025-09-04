package com.example.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.auth.dto.CompanyRegisterRequest;
import com.example.auth.dto.JwtResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.exception.UserAlreadyExistsException;
import com.example.auth.exception.UserNotFoundException;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import com.example.auth.util.JwtUtil;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public JwtResponse registerUser(RegisterRequest registerRequest) {
        // Basic validation
        if (registerRequest.getUsername() == null || registerRequest.getUsername().isBlank()
            || registerRequest.getEmail() == null || registerRequest.getEmail().isBlank()
            || registerRequest.getPassword() == null || registerRequest.getPassword().isBlank()) {
            throw new IllegalArgumentException("username, email and password are required");
        }
        // Check if username exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken!");
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email is already in use!");
        }
        
        // Create new user
        User user = new User(
            registerRequest.getUsername(),
            registerRequest.getEmail(),
            passwordEncoder.encode(registerRequest.getPassword())
        );
        
        user.setRole(Role.USER);
        userRepository.save(user);
        
        // Generate JWT token
        String jwt = jwtUtil.generateJwtToken(user.getUsername());
        
        return new JwtResponse(
            jwt,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name()
        );
    }

    public JwtResponse registerCompany(CompanyRegisterRequest request) {
        // Basic validation
        if (request.getCompanyName() == null || request.getCompanyName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("companyName, email and password are required");
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email is already in use!");
        }
        
        // Create new company user
        User user = new User();
        user.setUsername(request.getCompanyName()); // Use company name as username
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.COMPANY);
        user.setCompanyName(request.getCompanyName());
        user.setCompanyWebsite(request.getCompanyWebsite());
        user.setCompanyContactName(request.getCompanyContactName());
        user.setCompanyContactPhone(request.getCompanyContactPhone());
        
        userRepository.save(user);
        
        // Generate JWT token
        String jwt = jwtUtil.generateJwtToken(user.getUsername());
        
        return new JwtResponse(
            jwt,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name(),
            user.getCompanyName(),
            user.getCompanyWebsite(),
            user.getCompanyContactName(),
            user.getCompanyContactPhone()
        );
    }

    // Student/company-specific registration removed. Use registerUser(RegisterRequest) instead.
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        // First find the user by email to get the username
        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new UserNotFoundException("User not found with email: " + loginRequest.getEmail()));
        // If loginRequest specifies a role, ensure it matches the stored user role
        if (loginRequest.getRole() != null) {
            try {
                Role requested = Role.valueOf(loginRequest.getRole().toUpperCase());
                if (requested != user.getRole()) {
                    throw new UserNotFoundException("No user with that role and email");
                }
            } catch (IllegalArgumentException e) {
                throw new UserNotFoundException("Invalid role specified");
            }
        }

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                user.getUsername(), // Use the username for authentication
                loginRequest.getPassword()
            )
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateJwtToken(userDetails.getUsername());
        
        if (user.getRole() == Role.COMPANY) {
            return new JwtResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCompanyName(),
                user.getCompanyWebsite(),
                user.getCompanyContactName(),
                user.getCompanyContactPhone()
            );
        } else {
            return new JwtResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
            );
        }
    }
}