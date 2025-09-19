package com.medisync.medisync.service;
import com.medisync.medisync.entity.User;
import com.medisync.medisync.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Added annotation
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;


    @CachePut(value = "userDetails", key = "#result.username")
    @CacheEvict(value = "allUsers", allEntries = true)
    @Transactional
    public User saveUser(User user) {
        log.info("Saving user with username: {}", user.getUsername());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepo.save(user);
        log.info("User saved successfully with ID: {}", savedUser.getId());
        return savedUser;
    }

    @Cacheable(value = "allUsers", key = "'all'")
    public List<User> findAllUsers() {
        log.info("Fetching all users from the database");
        List<User> users = userRepo.findAll();
        log.info("Total users found: {}", users.size());
        return users;
    }

    @Cacheable(value = "userDetails", key = "#id", condition = "#result != null && !#result.isEmpty()")
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

    @CacheEvict(value = {"userDetails", "allUsers"}, key = "#id", allEntries = true)
    public void deleteUserById(String id) {
        log.info("Deleting user by ID: {}", id);
        userRepo.deleteById(id);
        log.info("User deleted successfully.");
    }

    @Cacheable(value = "userDetails", key = "#username", unless="#result == null")
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