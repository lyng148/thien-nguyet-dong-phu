package com.bluemoon.fees.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String entityType;
    private Long entityId;
    private LocalDateTime createdAt;
    private boolean read;
    private Long userId;
} 