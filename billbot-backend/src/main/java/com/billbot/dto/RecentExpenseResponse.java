package com.billbot.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RecentExpenseResponse {

    private UUID id;
    private String merchant;
    private BigDecimal amount;
    private String currency;
    private String category;
    private String paymentMethod;
    private LocalDateTime expenseDate;

    public RecentExpenseResponse() {}

    public RecentExpenseResponse(
            UUID id,
            String merchant,
            BigDecimal amount,
            String currency,
            String category,
            String paymentMethod,
            LocalDateTime expenseDate
    ) {
        this.id = id;
        this.merchant = merchant;
        this.amount = amount;
        this.currency = currency;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.expenseDate = expenseDate;
    }

    public RecentExpenseResponse(
            UUID id,
            String merchant,
            BigDecimal amount,
            String category,
            LocalDateTime expenseDate
    ) {
        this.id = id;
        this.merchant = merchant;
        this.amount = amount;
        this.currency = "INR";
        this.category = category;
        this.paymentMethod = "UPI";
        this.expenseDate = expenseDate;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getMerchant() { return merchant; }
    public void setMerchant(String merchant) { this.merchant = merchant; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public LocalDateTime getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDateTime expenseDate) { this.expenseDate = expenseDate; }
}