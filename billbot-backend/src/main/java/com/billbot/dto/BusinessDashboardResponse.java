package com.billbot.dto;

import java.math.BigDecimal;
import java.util.List;

public record BusinessDashboardResponse(
        BigDecimal totalRevenue,
        BigDecimal totalPaid,
        BigDecimal totalOutstanding,
        BigDecimal totalOverdue,
        long totalInvoices,
        long paidInvoicesCount,
        long pendingInvoicesCount,
        long overdueInvoicesCount,
        long totalCustomers,
        long totalProducts,
        List<InvoiceResponse> recentInvoices,
        List<MonthlyRevenueResponse> monthlyRevenue,
        List<InvoiceStatusDistributionResponse> statusDistribution
) {}
