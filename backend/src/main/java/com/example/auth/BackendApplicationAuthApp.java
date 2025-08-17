package com.example.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example.auth")
public class BackendApplicationAuthApp {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplicationAuthApp.class, args);
    }
}