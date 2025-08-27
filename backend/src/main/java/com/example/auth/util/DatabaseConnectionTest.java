package com.example.auth.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnectionTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:8080/aaryabase?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true";
        String username = "root";
        String password = "";
        
        System.out.println("Testing MySQL connection...");
        System.out.println("URL: " + url);
        System.out.println("Username: " + username);
        System.out.println("Password: " + (password.isEmpty() ? "(empty)" : "(set)"));
        
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("MySQL Driver loaded successfully");
            
            Connection connection = DriverManager.getConnection(url, username, password);
            System.out.println("Connection successful!");
            
            // Test a simple query
            var statement = connection.createStatement();
            var resultSet = statement.executeQuery("SELECT 1");
            if (resultSet.next()) {
                System.out.println("Query test successful: " + resultSet.getInt(1));
            }
            
            connection.close();
            System.out.println("Connection closed successfully");
            
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL Driver not found: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("Connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
