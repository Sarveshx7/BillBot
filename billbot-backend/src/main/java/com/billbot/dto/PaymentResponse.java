package com.billbot.dto;

import com.billbot.entity.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID invoiceId,
        String invoiceNumber,
        String customerName,
        BigDecimal amount,
        LocalDate paymentDate,
        PaymentMethod paymentMethod,
        String transactionReference,
        String receiptNumber,
        String notes,
        LocalDateTime createdAt
) {}
