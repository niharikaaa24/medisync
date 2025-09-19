package com.medisync.medisync.controller;

import com.medisync.medisync.dto.LoginRequest;
import com.medisync.medisync.dto.LoginResponse;
import com.medisync.medisync.entity.User;
import com.medisync.medisync.security.JwtUtil;
import com.medisync.medisync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder; // Import this
import com.medisync.medisync.repository.CustomUserDetailsServiceImp;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private CustomUserDetailsServiceImp userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Authentication authentication;
        System.out.println("Login attempt for username: " + request.getUsername());
        try {

            UserDetails userDetailsForDebug = userDetailsService.loadUserByUsername(request.getUsername());


            if (passwordEncoder.matches(request.getPassword(), userDetailsForDebug.getPassword())) {
                System.out.println("Manual password check succeeded!");
            } else {
                System.err.println("Manual password check failed! Password mismatch.");
                return new ResponseEntity<>("Password mismatch during manual check.", HttpStatus.UNAUTHORIZED);
            }

            authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            System.out.println("Authentication successful for username: " + request.getUsername());
        } catch (BadCredentialsException e) {
            System.err.println("Login failed: Invalid username or password for: " + request.getUsername());
            Map<String, String> errorResponse = Collections.singletonMap("error", "Invalid username or password.");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        } catch (DisabledException e) {
            System.err.println("Login failed: Account disabled for username: " + request.getUsername());
            Map<String, String> errorResponse = Collections.singletonMap("error", "User account is disabled.");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        } catch (LockedException e) {
            System.err.println("Login failed: Account locked for username: " + request.getUsername());
            Map<String, String> errorResponse = Collections.singletonMap("error", "User account is locked.");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        } catch (AuthenticationException e) {
            System.err.println("Login failed: Generic authentication error for username: " + request.getUsername() + " - " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = Collections.singletonMap("error", "Authentication failed: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Login failed: Unexpected error during authentication for username: " + request.getUsername() + " - " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = Collections.singletonMap("error", "An unexpected error occurred during login.");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        UserDetails userDetails;
        try {

            userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            System.out.println("UserDetails loaded for: " + userDetails.getUsername());
            System.out.println("User's stored password hash: " + userDetails.getPassword());
        } catch (UsernameNotFoundException e) {
            System.err.println("Login failed: User details not found after authentication for username: " + request.getUsername());
            Map<String, String> errorResponse = Collections.singletonMap("error", "User details could not be retrieved.");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            System.err.println("Login failed: Error loading user details for username: " + request.getUsername() + " - " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = Collections.singletonMap("error", "Error retrieving user information.");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("");
        System.out.println("User role extracted: " + role);

        String jwt;
        try {
            jwt = jwtUtil.generateToken(userDetails.getUsername(), role);
            System.out.println("JWT generated successfully for: " + userDetails.getUsername());
        } catch (Exception e) {
            System.err.println("Failed to generate JWT for: " + userDetails.getUsername() + " - " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = Collections.singletonMap("error", "Failed to generate authentication token.");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(new LoginResponse(jwt, role), HttpStatus.OK);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            userService.saveUser(user);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Signup successful! You can now log in.");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Signup error: " + e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("duplicate key error")) {
                errorResponse.put("error", "Username already exists. Please choose a different username.");
            } else {
                errorResponse.put("error", "Signup failed: " + (errorMessage != null ? errorMessage : "An unexpected error occurred."));
            }
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
}