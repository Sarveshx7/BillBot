package com.billbot.dto;

import java.math.BigDecimal;

public class CategorySpendingResponse {

    private String category;
    private BigDecimal amount;
    private Double percentage;
    private Integer count;

    public CategorySpendingResponse() {}

    public CategorySpendingResponse(String category, BigDecimal amount) {
        this.category = category;
        this.amount = amount;
        this.percentage = 0.0;
        this.count = 0;
    }

    public CategorySpendingResponse(String category, BigDecimal amount, Double percentage, Integer count) {
        this.category = category;
        this.amount = amount;
        this.percentage = percentage;
        this.count = count;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}