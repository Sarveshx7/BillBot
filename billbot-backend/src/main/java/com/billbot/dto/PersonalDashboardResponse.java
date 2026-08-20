package com.billbot.dto;

import java.math.BigDecimal;
import java.util.List;

public record PersonalDashboardResponse(
        BigDecimal totalSpentThisMonth,
        BigDecimal totalSpentLastMonth,
        BigDecimal monthlySpendChangePercent,
        BigDecimal totalUnpaidDues,
        long upcomingDuesCount,
        BigDecimal monthlySubscriptionBurnRate,
        long activeSubscriptionsCount,
        long totalExpensesCount,
        List<RecentExpenseResponse> recentExpenses,
        List<BillDueResponse> upcomingDues,
        List<SubscriptionResponse> activeSubscriptions,
        List<CategorySpendingResponse> categorySpending,
        List<MonthlySpendingResponse> monthlySpendingTrend
) {}