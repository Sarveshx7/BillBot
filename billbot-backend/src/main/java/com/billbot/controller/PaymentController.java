package com.billbot.controller;

import com.billbot.dto.PaymentRequest;
import com.billbot.dto.PaymentResponse;
import com.billbot.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> recordPayment(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        PaymentResponse response = paymentService.recordPayment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getPayments(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> getInvoicePayments(
            @PathVariable UUID invoiceId,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(paymentService.getInvoicePayments(invoiceId, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        paymentService.deletePayment(id, userId);
        return ResponseEntity.noContent().build();
    }
}
