package com.medisync.medisync.controller;

import com.medisync.medisync.dto.LoginRequest;
import com.medisync.medisync.dto.LoginResponse;
import com.medisync.medisync.entity.User;
import com.medisync.medisync.security.JwtUtil;
import com.medisync.medisync.service.UserService;
import com.medisync.medisync.repository.CustomUserDetailsServiceImp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;
    private CustomUserDetailsServiceImp userDetailsService;
    private JwtUtil jwtUtil;
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {

            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());


            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("");

            String jwt = jwtUtil.generateToken(userDetails.getUsername(), role);

            return ResponseEntity.ok(new LoginResponse(jwt, role));

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.saveUser(user);
            response.put("message", "Signup successful! You can now log in.");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("duplicate key")) {
                response.put("error", "Username already exists.");
            } else {
                response.put("error", "Signup failed. Try again later.");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
