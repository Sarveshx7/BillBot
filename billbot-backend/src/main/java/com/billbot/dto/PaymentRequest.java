package com.billbot.dto;

import com.billbot.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentRequest(
        @NotNull(message = "Invoice ID is required")
        UUID invoiceId,
        @NotNull(message = "Payment amount is required")
        @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
        BigDecimal amount,
        LocalDate paymentDate,
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,
        String transactionReference,
        String notes
) {}
