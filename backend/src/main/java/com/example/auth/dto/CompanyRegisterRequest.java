package com.example.auth.dto;

public class CompanyRegisterRequest {
    private String username;
    private String email;
    private String password;
    private String companyName;
    private String companyWebsite;
    private String companyContactName;
    private String companyContactPhone;

    public CompanyRegisterRequest() {}

    // Getters/setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    public String getCompanyContactName() { return companyContactName; }
    public void setCompanyContactName(String companyContactName) { this.companyContactName = companyContactName; }
    public String getCompanyContactPhone() { return companyContactPhone; }
    public void setCompanyContactPhone(String companyContactPhone) { this.companyContactPhone = companyContactPhone; }
}
