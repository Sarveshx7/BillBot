package com.billbot.service;

import com.billbot.dto.SubscriptionRequest;
import com.billbot.dto.SubscriptionResponse;
import com.billbot.entity.Subscription;
import com.billbot.entity.User;
import com.billbot.repository.SubscriptionRepository;
import com.billbot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            UserRepository userRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<SubscriptionResponse> getAll(String userId, String status) {
        User user = getUser(userId);
        List<Subscription> list;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            list = subscriptionRepository.findByUserAndStatusOrderByNextBillingDateAsc(user, status.toUpperCase());
        } else {
            list = subscriptionRepository.findByUserOrderByNextBillingDateAsc(user);
        }
        return list.stream().map(this::mapToResponse).toList();
    }

    public SubscriptionResponse getById(UUID id, String userId) {
        User user = getUser(userId);
        Subscription sub = subscriptionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        return mapToResponse(sub);
    }

    public SubscriptionResponse create(SubscriptionRequest request, String userId) {
        User user = getUser(userId);

        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setName(request.getName().trim());
        sub.setAmount(request.getAmount());
        sub.setCurrency(request.getCurrency() != null ? request.getCurrency() : user.getCurrency());
        sub.setBillingCycle(request.getBillingCycle() != null ? request.getBillingCycle().toUpperCase() : "MONTHLY");
        sub.setNextBillingDate(request.getNextBillingDate() != null ? request.getNextBillingDate() : LocalDate.now().plusMonths(1));
        sub.setCategory(request.getCategory() != null ? request.getCategory().toUpperCase() : "ENTERTAINMENT");
        sub.setAutoDebit(request.isAutoDebit());
        sub.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE");
        sub.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Subscription saved = subscriptionRepository.save(sub);
        return mapToResponse(saved);
    }

    public SubscriptionResponse update(UUID id, SubscriptionRequest request, String userId) {
        User user = getUser(userId);
        Subscription sub = subscriptionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        sub.setName(request.getName().trim());
        sub.setAmount(request.getAmount());
        if (request.getCurrency() != null) sub.setCurrency(request.getCurrency());
        if (request.getBillingCycle() != null) sub.setBillingCycle(request.getBillingCycle().toUpperCase());
        if (request.getNextBillingDate() != null) sub.setNextBillingDate(request.getNextBillingDate());
        if (request.getCategory() != null) sub.setCategory(request.getCategory().toUpperCase());
        sub.setAutoDebit(request.isAutoDebit());
        if (request.getStatus() != null) sub.setStatus(request.getStatus().toUpperCase());
        sub.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Subscription saved = subscriptionRepository.save(sub);
        return mapToResponse(saved);
    }

    public void delete(UUID id, String userId) {
        User user = getUser(userId);
        Subscription sub = subscriptionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        subscriptionRepository.delete(sub);
    }

    public SubscriptionResponse mapToResponse(Subscription s) {
        long daysUntilRenewal = ChronoUnit.DAYS.between(LocalDate.now(), s.getNextBillingDate());

        BigDecimal monthlyEquivalent = s.getAmount();
        if ("YEARLY".equalsIgnoreCase(s.getBillingCycle())) {
            monthlyEquivalent = s.getAmount().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        } else if ("QUARTERLY".equalsIgnoreCase(s.getBillingCycle())) {
            monthlyEquivalent = s.getAmount().divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
        } else if ("WEEKLY".equalsIgnoreCase(s.getBillingCycle())) {
            monthlyEquivalent = s.getAmount().multiply(BigDecimal.valueOf(4.33)).setScale(2, RoundingMode.HALF_UP);
        }

        return new SubscriptionResponse(
                s.getId(),
                s.getName(),
                s.getAmount(),
                monthlyEquivalent,
                s.getCurrency(),
                s.getBillingCycle(),
                s.getNextBillingDate(),
                s.getCategory(),
                s.isAutoDebit(),
                s.getStatus(),
                s.getNotes(),
                daysUntilRenewal,
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}