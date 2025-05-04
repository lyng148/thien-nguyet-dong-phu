package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.Notification;
import com.bluemoon.fees.entity.User;
import com.bluemoon.fees.repository.NotificationRepository;
import com.bluemoon.fees.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(String title, String message, Notification.EntityType entityType, Long entityId, User user) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .entityType(entityType)
                .entityId(entityId)
                .user(user)
                .build();
        
        notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByReadFalseOrderByCreatedAtDesc();
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    @Override
    public long getUnreadCount() {
        return notificationRepository.countByReadFalse();
    }
} 