package com.billbot.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ExpenseResponse {

    private UUID id;
    private String merchant;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime expenseDate;
    private String category;
    private String paymentMethod;
    private String source;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ExpenseResponse(
            UUID id,
            String merchant,
            BigDecimal amount,
            String currency,
            LocalDateTime expenseDate,
            String category,
            String paymentMethod,
            String source,
            String notes,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.merchant = merchant;
        this.amount = amount;
        this.currency = currency;
        this.expenseDate = expenseDate;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.source = source;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getMerchant() {
        return merchant;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public LocalDateTime getExpenseDate() {
        return expenseDate;
    }

    public String getCategory() {
        return category;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getSource() {
        return source;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}