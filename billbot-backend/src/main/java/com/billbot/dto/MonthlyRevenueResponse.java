package com.billbot.dto;

import java.math.BigDecimal;

public record MonthlyRevenueResponse(
        String month,
        BigDecimal revenue,
        BigDecimal paid,
        long invoiceCount
) {}
