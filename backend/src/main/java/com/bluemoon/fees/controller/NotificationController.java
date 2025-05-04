package com.bluemoon.fees.controller;

import com.bluemoon.fees.dto.NotificationDTO;
import com.bluemoon.fees.entity.Notification;
import com.bluemoon.fees.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount());
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .entityType(notification.getEntityType().toString())
                .entityId(notification.getEntityId())
                .createdAt(notification.getCreatedAt())
                .read(notification.isRead())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .build();
    }
} 