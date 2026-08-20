package com.billbot.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SubscriptionRequest {

    @NotBlank(message = "Subscription name is required")
    private String name;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String currency = "INR";
    private String billingCycle = "MONTHLY"; // MONTHLY, YEARLY, QUARTERLY, WEEKLY

    @NotNull(message = "Next billing date is required")
    private LocalDate nextBillingDate;

    private String category = "ENTERTAINMENT";
    private boolean autoDebit = true;
    private String status = "ACTIVE"; // ACTIVE, PAUSED, CANCELLED
    private String notes;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }
    public LocalDate getNextBillingDate() { return nextBillingDate; }
    public void setNextBillingDate(LocalDate nextBillingDate) { this.nextBillingDate = nextBillingDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isAutoDebit() { return autoDebit; }
    public void setAutoDebit(boolean autoDebit) { this.autoDebit = autoDebit; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}