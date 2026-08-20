package com.billbot.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record BillDueResponse(
        UUID id,
        String billerName,
        BigDecimal amount,
        String currency,
        LocalDate dueDate,
        String category,
        String recurringFrequency,
        boolean isPaid,
        LocalDate paidDate,
        boolean autoPay,
        String notes,
        long daysUntilDue,
        boolean isOverdue,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}