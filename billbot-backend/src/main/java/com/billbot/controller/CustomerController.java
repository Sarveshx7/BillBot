package com.billbot.controller;

import com.billbot.dto.CustomerRequest;
import com.billbot.dto.CustomerResponse;
import com.billbot.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid @RequestBody CustomerRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        CustomerResponse response = customerService.createCustomer(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getCustomers(
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(customerService.searchCustomers(search, userId));
        }
        return ResponseEntity.ok(customerService.getUserCustomers(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomer(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(customerService.getCustomer(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable UUID id,
            @Valid @RequestBody CustomerRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(customerService.updateCustomer(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        customerService.deleteCustomer(id, userId);
        return ResponseEntity.noContent().build();
    }
}
