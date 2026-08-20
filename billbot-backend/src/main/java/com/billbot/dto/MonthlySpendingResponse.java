package com.billbot.dto;

import java.math.BigDecimal;

public class MonthlySpendingResponse {

    private String month;
    private BigDecimal amount;
    private Integer count;

    public MonthlySpendingResponse() {}

    public MonthlySpendingResponse(String month, BigDecimal amount) {
        this.month = month;
        this.amount = amount;
        this.count = 0;
    }

    public MonthlySpendingResponse(String month, BigDecimal amount, Integer count) {
        this.month = month;
        this.amount = amount;
        this.count = count;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}