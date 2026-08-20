package com.billbot.controller;

import com.billbot.dto.ExpenseRequest;
import com.billbot.dto.ExpenseResponse;
import com.billbot.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        ExpenseResponse response =
                expenseService.createExpense(request, userId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // GET ALL
    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                expenseService.getUserExpenses(userId)
        );
    }


    // GET ONE
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpense(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                expenseService.getExpense(id, userId)
        );
    }


    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable UUID id,
            @Valid @RequestBody ExpenseRequest request,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                expenseService.updateExpense(
                        id,
                        request,
                        userId
                )
        );
    }


    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        expenseService.deleteExpense(id, userId);

        return ResponseEntity.noContent().build();
    }
}