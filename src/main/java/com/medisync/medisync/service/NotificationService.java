package com.medisync.medisync.service;

import com.medisync.medisync.entity.Notification;
import com.medisync.medisync.entity.User;
import com.medisync.medisync.repository.NotificationRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepo notificationRepo;
    private final UserService userService;

    public Notification sendNotification(String userMongoId, String message) {
        log.info("Creating notification for user ID: {}", userMongoId);

        Optional<User> userOptional = userService.findUserById(userMongoId);

        if (userOptional.isPresent()) {
            Notification notification = Notification.builder()
                    .recipientId(userMongoId) // Store the user's Mongo ID directly
                    .message(message)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            log.info("Notification saved for user ID: {}", userMongoId);
            return notificationRepo.save(notification);
        } else {
            log.error("User not found for notification with ID: {}", userMongoId);
            throw new IllegalArgumentException("User not found for notification with ID: " + userMongoId);
        }
    }

    public List<Notification> getNotificationsForUser(String userId) {
        log.info("Fetching notifications for user ID: {}", userId);
        return notificationRepo.findByRecipientIdOrderByTimestampDesc(userId);
    }
}