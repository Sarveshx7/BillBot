package com.billbot.dto;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsResponse {

    private BigDecimal totalSpent;
    private BigDecimal averageExpense;
    private BigDecimal highestExpense;
    private long totalTransactions;

    private List<MonthlySpendingResponse> monthlySpending;
    private List<CategorySpendingResponse> categorySpending;

    public AnalyticsResponse(
            BigDecimal totalSpent,
            BigDecimal averageExpense,
            BigDecimal highestExpense,
            long totalTransactions,
            List<MonthlySpendingResponse> monthlySpending,
            List<CategorySpendingResponse> categorySpending
    ) {
        this.totalSpent = totalSpent;
        this.averageExpense = averageExpense;
        this.highestExpense = highestExpense;
        this.totalTransactions = totalTransactions;
        this.monthlySpending = monthlySpending;
        this.categorySpending = categorySpending;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public BigDecimal getAverageExpense() {
        return averageExpense;
    }

    public BigDecimal getHighestExpense() {
        return highestExpense;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public List<MonthlySpendingResponse> getMonthlySpending() {
        return monthlySpending;
    }

    public List<CategorySpendingResponse> getCategorySpending() {
        return categorySpending;
    }
}