package com.billbot.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class BillDueRequest {

    @NotBlank(message = "Biller / Provider name is required")
    private String billerName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String currency = "INR";

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String category = "BILLS";
    private String recurringFrequency = "MONTHLY";
    private boolean autoPay = false;
    private String notes;

    public String getBillerName() { return billerName; }
    public void setBillerName(String billerName) { this.billerName = billerName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getRecurringFrequency() { return recurringFrequency; }
    public void setRecurringFrequency(String recurringFrequency) { this.recurringFrequency = recurringFrequency; }
    public boolean isAutoPay() { return autoPay; }
    public void setAutoPay(boolean autoPay) { this.autoPay = autoPay; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}