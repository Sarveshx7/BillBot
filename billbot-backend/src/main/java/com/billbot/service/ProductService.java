package com.billbot.service;

import com.billbot.dto.ProductRequest;
import com.billbot.dto.ProductResponse;
import com.billbot.entity.Product;
import com.billbot.entity.User;
import com.billbot.repository.ProductRepository;
import com.billbot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    public ProductResponse createProduct(ProductRequest request, String userId) {
        User user = getUser(userId);

        Product product = new Product();
        product.setUser(user);
        product.setName(request.name().trim());
        product.setDescription(request.description() != null ? request.description().trim() : null);
        product.setSku(request.sku() != null ? request.sku().trim() : null);
        product.setUnitPrice(request.unitPrice() != null ? request.unitPrice() : BigDecimal.ZERO);
        product.setTaxRate(request.taxRate() != null ? request.taxRate() : BigDecimal.ZERO);
        product.setUnit(request.unit() != null && !request.unit().isBlank() ? request.unit().trim() : "unit");
        product.setCategory(request.category() != null ? request.category().trim() : null);
        product.setActive(request.active() == null || request.active());

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getUserProducts(String userId) {
        User user = getUser(userId);
        return productRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts(String userId) {
        User user = getUser(userId);
        return productRepository.findByUserAndActiveTrueOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID id, String userId) {
        User user = getUser(userId);
        Product product = productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return mapToResponse(product);
    }

    public ProductResponse updateProduct(UUID id, ProductRequest request, String userId) {
        User user = getUser(userId);
        Product product = productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        product.setName(request.name().trim());
        product.setDescription(request.description() != null ? request.description().trim() : null);
        product.setSku(request.sku() != null ? request.sku().trim() : null);
        product.setUnitPrice(request.unitPrice() != null ? request.unitPrice() : BigDecimal.ZERO);
        product.setTaxRate(request.taxRate() != null ? request.taxRate() : BigDecimal.ZERO);
        product.setUnit(request.unit() != null && !request.unit().isBlank() ? request.unit().trim() : "unit");
        product.setCategory(request.category() != null ? request.category().trim() : null);
        if (request.active() != null) {
            product.setActive(request.active());
        }

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    public void deleteProduct(UUID id, String userId) {
        User user = getUser(userId);
        Product product = productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String query, String userId) {
        User user = getUser(userId);
        if (query == null || query.isBlank()) {
            return getUserProducts(userId);
        }
        return productRepository.searchProducts(user, query.trim()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getSku(),
                product.getUnitPrice(),
                product.getTaxRate(),
                product.getUnit(),
                product.getCategory(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
