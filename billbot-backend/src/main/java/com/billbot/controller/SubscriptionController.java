package com.billbot.controller;

import com.billbot.dto.SubscriptionRequest;
import com.billbot.dto.SubscriptionResponse;
import com.billbot.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>> getAllSubscriptions(
            @RequestParam(required = false) String status,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(subscriptionService.getAll(userId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> getSubscriptionById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(subscriptionService.getById(id, userId));
    }

    @PostMapping
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @Valid @RequestBody SubscriptionRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        SubscriptionResponse response = subscriptionService.create(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> updateSubscription(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(subscriptionService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        subscriptionService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}