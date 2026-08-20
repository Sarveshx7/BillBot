package com.billbot.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        String name,
        BigDecimal amount,
        BigDecimal monthlyEquivalentAmount,
        String currency,
        String billingCycle,
        LocalDate nextBillingDate,
        String category,
        boolean autoDebit,
        String status,
        String notes,
        long daysUntilRenewal,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}