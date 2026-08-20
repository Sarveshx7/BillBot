package com.billbot.dto;

import java.math.BigDecimal;

public class DashboardResponse {

    private BigDecimal totalSpent;
    private BigDecimal thisMonth;
    private long expenseCount;
    private String topCategory;

    public DashboardResponse(
            BigDecimal totalSpent,
            BigDecimal thisMonth,
            long expenseCount,
            String topCategory
    ) {
        this.totalSpent = totalSpent;
        this.thisMonth = thisMonth;
        this.expenseCount = expenseCount;
        this.topCategory = topCategory;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public BigDecimal getThisMonth() {
        return thisMonth;
    }

    public long getExpenseCount() {
        return expenseCount;
    }

    public String getTopCategory() {
        return topCategory;
    }
}