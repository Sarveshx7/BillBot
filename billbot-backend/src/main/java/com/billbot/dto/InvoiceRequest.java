package com.billbot.dto;

import com.billbot.entity.DiscountType;
import com.billbot.entity.InvoiceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceRequest(
        @NotNull(message = "Customer ID is required")
        UUID customerId,
        String invoiceNumber,
        @NotNull(message = "Invoice date is required")
        LocalDate invoiceDate,
        @NotNull(message = "Due date is required")
        LocalDate dueDate,
        InvoiceStatus status,
        DiscountType discountType,
        BigDecimal discountValue,
        String currency,
        String notes,
        String terms,
        @NotEmpty(message = "Invoice must contain at least one item")
        @Valid
        List<InvoiceItemRequest> items
) {}
