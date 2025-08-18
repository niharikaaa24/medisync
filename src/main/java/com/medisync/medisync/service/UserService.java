
package com.medisync.medisync.service;
import com.medisync.medisync.entity.User;
import com.medisync.medisync.repository.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void saveUser(User user) {
        try {
            log.info("Saving user with username: {}", user.getUsername());

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepo.save(user);

            log.info("User saved successfully.");
        } catch (Exception e) {
            log.error("Error occurred while saving user: {}", e.getMessage());
        }
    }

    public List<User> findAllUsers() {
        log.info("Fetching all users from the database");
        List<User> users = userRepo.findAll();
        log.info("Total users found: {}", users.size());
        return users;
    }

    public Optional<User> findUserById(String id) {
        log.info("Fetching user by ID: {}", id);
        Optional<User> user = userRepo.findById(id);
        if (user.isPresent()) {
            log.info("User found: {}", user.get().getUsername());
        } else {
            log.warn("User not found with ID: {}", id);
        }
        return user;
    }

    public void deleteUserById(String id) {
        log.info("Deleting user by ID: {}", id);
        userRepo.deleteById(id);
        log.info("User deleted successfully.");
    }

    public Optional<User> findByUsername(String username) {
        log.info("Searching for user by username: {}", username);
        Optional<User> userOptional = userRepo.findByUsername(username);
        if (userOptional.isPresent()) {
            log.info("User found with username: {}", username);
        } else {
            log.warn("User not found with username: {}", username);
        }
        return userOptional;
    }
}
