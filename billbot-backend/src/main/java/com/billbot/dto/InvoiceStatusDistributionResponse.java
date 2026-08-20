package com.billbot.dto;

public record InvoiceStatusDistributionResponse(
        String status,
        long count,
        double percentage
) {}
