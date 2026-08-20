package com.billbot.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String name,
        String username,
        String email,
        String currency,
        String timezone,
        String businessName,
        String businessPhone,
        String businessAddress,
        String taxNumber,
        String invoicePrefix,
        String invoiceNotesDefault,
        String termsDefault,
        LocalDateTime createdAt
) {}
