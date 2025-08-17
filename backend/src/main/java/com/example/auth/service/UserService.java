package com.example.auth.service;

import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User updateUser(String username, User userDetails) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            user.setEmail(userDetails.getEmail());
            // Don't update password here without proper validation
            return userRepository.save(user);
        }
        return null;
    }
}
