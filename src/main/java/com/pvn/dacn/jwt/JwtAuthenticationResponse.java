package com.pvn.dacn.jwt;

public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private int role;

    public JwtAuthenticationResponse(String accessToken, String username, int role) {
        this.accessToken = accessToken;
        this.username = username;
        this.role = role;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public int getRole() { return role; }
    public void setRole(int role) { this.role = role; }
}