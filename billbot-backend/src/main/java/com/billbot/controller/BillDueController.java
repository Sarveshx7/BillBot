package com.billbot.controller;

import com.billbot.dto.BillDueRequest;
import com.billbot.dto.BillDueResponse;
import com.billbot.service.BillDueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bills")
public class BillDueController {

    private final BillDueService billDueService;

    public BillDueController(BillDueService billDueService) {
        this.billDueService = billDueService;
    }

    @GetMapping
    public ResponseEntity<List<BillDueResponse>> getAllBills(
            @RequestParam(required = false) Boolean isPaid,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(billDueService.getAll(userId, isPaid));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDueResponse> getBillById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(billDueService.getById(id, userId));
    }

    @PostMapping
    public ResponseEntity<BillDueResponse> createBill(
            @Valid @RequestBody BillDueRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        BillDueResponse response = billDueService.create(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillDueResponse> updateBill(
            @PathVariable UUID id,
            @Valid @RequestBody BillDueRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(billDueService.update(id, request, userId));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<BillDueResponse> markAsPaid(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "true") boolean createExpense,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(billDueService.markAsPaid(id, createExpense, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        billDueService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}