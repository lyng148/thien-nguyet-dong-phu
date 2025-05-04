package com.bluemoon.fees.service;

import com.bluemoon.fees.entity.Notification;
import com.bluemoon.fees.entity.User;

import java.util.List;

public interface NotificationService {
    void createNotification(String title, String message, Notification.EntityType entityType, Long entityId, User user);
    
    List<Notification> getUnreadNotifications();
    
    List<Notification> getUserNotifications(Long userId);
    
    void markAsRead(Long notificationId);
    
    long getUnreadCount();
} 