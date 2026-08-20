package com.billbot.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String description,
        String sku,
        BigDecimal unitPrice,
        BigDecimal taxRate,
        String unit,
        String category,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
