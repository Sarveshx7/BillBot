package com.billbot.controller;

import com.billbot.dto.UserProfileRequest;
import com.billbot.dto.UserProfileResponse;
import com.billbot.entity.User;
import com.billbot.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        String userId = authentication.getName();
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(mapToResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UserProfileRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.name().trim());
        if (request.username() != null && !request.username().isBlank()) {
            String uname = request.username().trim().toLowerCase();
            // Allow user to keep their existing username or pick a unique new one
            if (!uname.equalsIgnoreCase(user.getUsername()) && userRepository.existsByUsername(uname)) {
                throw new RuntimeException("Username is already taken");
            }
            user.setUsername(uname);
        }
        if (request.currency() != null && !request.currency().isBlank()) {
            user.setCurrency(request.currency().trim());
        }
        if (request.timezone() != null && !request.timezone().isBlank()) {
            user.setTimezone(request.timezone().trim());
        }
        user.setBusinessName(request.businessName() != null ? request.businessName().trim() : null);
        user.setBusinessPhone(request.businessPhone() != null ? request.businessPhone().trim() : null);
        user.setBusinessAddress(request.businessAddress() != null ? request.businessAddress().trim() : null);
        user.setTaxNumber(request.taxNumber() != null ? request.taxNumber().trim() : null);
        if (request.invoicePrefix() != null && !request.invoicePrefix().isBlank()) {
            user.setInvoicePrefix(request.invoicePrefix().trim());
        }
        user.setInvoiceNotesDefault(request.invoiceNotesDefault() != null ? request.invoiceNotesDefault().trim() : null);
        user.setTermsDefault(request.termsDefault() != null ? request.termsDefault().trim() : null);

        User saved = userRepository.save(user);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    private UserProfileResponse mapToResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getCurrency(),
                user.getTimezone(),
                user.getBusinessName(),
                user.getBusinessPhone(),
                user.getBusinessAddress(),
                user.getTaxNumber(),
                user.getInvoicePrefix(),
                user.getInvoiceNotesDefault(),
                user.getTermsDefault(),
                user.getCreatedAt()
        );
    }
}
