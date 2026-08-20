package com.billbot.dto;

import com.billbot.entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;

public record InvoiceStatusUpdateRequest(
        @NotNull(message = "Status is required")
        InvoiceStatus status
) {}
