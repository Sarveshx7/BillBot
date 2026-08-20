package com.billbot.repository;

import com.billbot.entity.AppNotification;
import com.billbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<AppNotification, UUID> {

    List<AppNotification> findTop30ByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);

    Optional<AppNotification> findByIdAndUser(UUID id, User user);
}