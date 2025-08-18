package com.medisync.medisync.repository;

import com.medisync.medisync.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepo extends MongoRepository<Notification, String> {

    List<Notification> findByUserId(String username);
}
