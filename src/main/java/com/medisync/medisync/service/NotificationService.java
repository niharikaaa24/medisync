package com.medisync.medisync.service;

import com.medisync.medisync.entity.Notification;
import com.medisync.medisync.entity.User;
import com.medisync.medisync.repository.NotificationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime; // Import for timestamp
import java.util.List;
import java.util.Optional; // Import for Optional handling

@Service
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private UserService userService; // This is crucial for getting username from ID

    public Notification sendNotification(String userMongoId, String message) {
        Notification notification = new Notification();

        Optional<User> userOptional = userService.findUserById(userMongoId);

        if (userOptional.isPresent()) {
            notification.setUserId(userOptional.get().getUsername()); // ✅ Store username
            notification.setMessage(message);
            notification.setTimestamp(LocalDateTime.now());
            return notificationRepo.save(notification);
        } else {
            throw new IllegalArgumentException("User not found for notification with ID: " + userMongoId);
        }
    }

    public List<Notification> getNotificationsForUser(String username) {
        return notificationRepo.findByUserId(username);

    }
}
