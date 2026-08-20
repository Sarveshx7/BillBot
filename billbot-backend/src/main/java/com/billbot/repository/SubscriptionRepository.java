package com.billbot.repository;

import com.billbot.entity.Subscription;
import com.billbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    List<Subscription> findByUserOrderByNextBillingDateAsc(User user);

    List<Subscription> findByUserAndStatusOrderByNextBillingDateAsc(User user, String status);

    Optional<Subscription> findByIdAndUser(UUID id, User user);

    long countByUserAndStatus(User user, String status);

    @Query("SELECT s FROM Subscription s WHERE s.user = :user AND s.status = 'ACTIVE' ORDER BY s.nextBillingDate ASC")
    List<Subscription> findActiveSubscriptions(@Param("user") User user);
}