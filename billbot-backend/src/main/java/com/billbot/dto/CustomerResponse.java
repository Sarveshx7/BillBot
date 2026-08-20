package com.billbot.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CustomerResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String companyName,
        String billingAddress,
        String shippingAddress,
        String city,
        String state,
        String postalCode,
        String taxNumber,
        String notes,
        long totalInvoices,
        BigDecimal totalBilled,
        BigDecimal totalPaid,
        BigDecimal outstandingBalance,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
