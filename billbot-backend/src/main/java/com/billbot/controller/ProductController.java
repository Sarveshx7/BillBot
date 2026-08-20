package com.billbot.controller;

import com.billbot.dto.ProductRequest;
import com.billbot.dto.ProductResponse;
import com.billbot.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        ProductResponse response = productService.createProduct(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.searchProducts(search, userId));
        }
        if (activeOnly) {
            return ResponseEntity.ok(productService.getActiveProducts(userId));
        }
        return ResponseEntity.ok(productService.getUserProducts(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(productService.getProduct(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(productService.updateProduct(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        productService.deleteProduct(id, userId);
        return ResponseEntity.noContent().build();
    }
}
