package com.billbot.dto;

import com.billbot.entity.DiscountType;
import com.billbot.entity.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        String invoiceNumber,
        UUID customerId,
        String customerName,
        String customerEmail,
        String customerPhone,
        String customerAddress,
        String customerTaxNumber,
        LocalDate invoiceDate,
        LocalDate dueDate,
        InvoiceStatus status,
        BigDecimal subtotal,
        BigDecimal taxTotal,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal discountTotal,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        BigDecimal amountDue,
        String currency,
        String notes,
        String terms,
        List<InvoiceItemResponse> items,
        List<PaymentResponse> payments,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
