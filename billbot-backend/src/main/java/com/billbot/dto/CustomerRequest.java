package com.billbot.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public record CustomerRequest(
        @NotBlank(message = "Customer name is required")
        String name,
        String email,
        String phone,
        String companyName,
        String billingAddress,
        String shippingAddress,
        String city,
        String state,
        String postalCode,
        String taxNumber,
        String notes
) {}
