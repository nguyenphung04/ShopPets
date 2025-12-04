package com.pvn.dacn.controller;

import com.pvn.dacn.dto.UserCreateDTO;
import com.pvn.dacn.dto.LoginDTO;
import com.pvn.dacn.entity.User;
import com.pvn.dacn.jwt.JwtAuthenticationResponse;
import com.pvn.dacn.security.JwtTokenProvider;
import com.pvn.dacn.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        User user = userService.getUserByUsername(loginRequest.getUsername());
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt, user.getUsername(), user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserCreateDTO request) {
        try {
            userService.createRequest(request);
            return ResponseEntity.ok(Collections.singletonMap("message", "Đăng ký thành công!"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Tên đăng nhập đã tồn tại")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}