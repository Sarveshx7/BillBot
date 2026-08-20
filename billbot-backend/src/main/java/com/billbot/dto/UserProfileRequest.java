package com.billbot.dto;

import jakarta.validation.constraints.NotBlank;

public record UserProfileRequest(
        @NotBlank(message = "Name is required")
        String name,
        String username,
        String currency,
        String timezone,
        String businessName,
        String businessPhone,
        String businessAddress,
        String taxNumber,
        String invoicePrefix,
        String invoiceNotesDefault,
        String termsDefault
) {}
