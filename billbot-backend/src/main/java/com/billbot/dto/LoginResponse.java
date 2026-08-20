package com.billbot.dto;

public class LoginResponse {

    private String token;
    private String tokenType;
    private String userId;
    private String name;
    private String username;
    private String email;

    public LoginResponse(
            String token,
            String tokenType,
            String userId,
            String name,
            String username,
            String email
    ) {
        this.token = token;
        this.tokenType = tokenType;
        this.userId = userId;
        this.name = name;
        this.username = username;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}