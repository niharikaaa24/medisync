
package com.medisync.medisync.controller;

import com.medisync.medisync.entity.User;
import com.medisync.medisync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/user")
public class UserController {


    @Autowired
    private UserService userService;

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/all")
    public ResponseEntity getusers() {
        List<User> users= userService.findAllUsers();

        if(users!=null) {
            return new ResponseEntity<>(users, HttpStatus.ACCEPTED);
        }
        else
            return new ResponseEntity(HttpStatus.NOT_FOUND);
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        Optional<User> foundUser = userService.findUserById(id);

        if (foundUser.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        User targetUser = foundUser.get();

        if (isAdmin || targetUser.getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(targetUser, HttpStatus.OK);
        }

        return new ResponseEntity<>("Access denied", HttpStatus.FORBIDDEN);
    }


    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        Optional<User> foundUserOptional = userService.findByUsername(username);

        if (foundUserOptional.isEmpty()) {
            return new ResponseEntity<>("User not found with username: " + username, HttpStatus.NOT_FOUND);
        }

        User foundUser = foundUserOptional.get();

        if (isAdmin || foundUser.getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(foundUser, HttpStatus.OK);
        }

        return new ResponseEntity<>("Access denied: You can only view your own profile or must be an admin.", HttpStatus.FORBIDDEN);
    }


    @PostMapping
    public ResponseEntity saveuser( @Valid @RequestBody User user)
    {
        try {
            userService.saveUser(user);
            return new ResponseEntity(HttpStatus.CREATED);
        }
        catch(Exception e)
        {
            return new ResponseEntity(HttpStatus.BAD_REQUEST);

        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        Optional<User> foundUser = userService.findUserById(id);

        if (foundUser.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        User targetUser = foundUser.get();

        if (isAdmin || targetUser.getUsername().equals(currentUsername)) {
            userService.deleteUserById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }

        return new ResponseEntity<>("Access denied", HttpStatus.FORBIDDEN);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User newEntry) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

        Optional<User> optionalUser = userService.findUserById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User existingUser = optionalUser.get();

        if (!isAdmin && !existingUser.getUsername().equals(currentUsername)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        if (newEntry.getUsername() != null && !newEntry.getUsername().isBlank()) {
            existingUser.setUsername(newEntry.getUsername());
        }
        if (newEntry.getPassword() != null && !newEntry.getPassword().isBlank()) {
            existingUser.setPassword(newEntry.getPassword());
        }
        if (newEntry.getPhoneNumber() != null && !newEntry.getPhoneNumber().isBlank()) {
            existingUser.setPhoneNumber(newEntry.getPhoneNumber());
        }
        if (isAdmin && newEntry.getRole() != null) {
            existingUser.setRole(newEntry.getRole());
        }

        userService.saveUser(existingUser);
        return ResponseEntity.ok(existingUser);
    }
}
