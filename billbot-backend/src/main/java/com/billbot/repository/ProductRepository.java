package com.billbot.repository;

import com.billbot.entity.Product;
import com.billbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByUserOrderByCreatedAtDesc(User user);

    List<Product> findByUserAndActiveTrueOrderByCreatedAtDesc(User user);

    Optional<Product> findByIdAndUser(UUID id, User user);

    long countByUser(User user);

    @Query("SELECT p FROM Product p WHERE p.user = :user AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("user") User user, @Param("query") String query);
}
