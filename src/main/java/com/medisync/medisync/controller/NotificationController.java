package com.medisync.medisync.controller;


import com.medisync.medisync.entity.CustomUserDetails;
import com.medisync.medisync.entity.Notification;
import com.medisync.medisync.repository.CustomUserDetailsServiceImp;
import com.medisync.medisync.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/notification")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/send")
    public ResponseEntity<Notification> sendNotification(@RequestParam String userId, @RequestParam String message) {
        Notification notification = notificationService.sendNotification(userId, message);
        return ResponseEntity.ok(notification);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String username;
        if (auth.getPrincipal() instanceof CustomUserDetails) {
            username = ((CustomUserDetails) auth.getPrincipal()).getUsername();

        } else {
            throw new RuntimeException("Invalid user authentication");
        }

        List<Notification> notifications = notificationService.getNotificationsForUser(username);
        return ResponseEntity.ok(notifications);
    }
}
