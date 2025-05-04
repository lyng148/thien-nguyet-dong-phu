package com.bluemoon.fees.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "entity_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EntityType entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public enum EntityType {
        FEE,
        HOUSEHOLD,
        PAYMENT
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        read = false;
    }
} 