package com.billbot.repository;

import com.billbot.entity.Customer;
import com.billbot.entity.Invoice;
import com.billbot.entity.InvoiceStatus;
import com.billbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findByUserOrderByInvoiceDateDescCreatedAtDesc(User user);

    List<Invoice> findByUserAndStatusOrderByInvoiceDateDesc(User user, InvoiceStatus status);

    List<Invoice> findByUserAndCustomerOrderByInvoiceDateDesc(User user, Customer customer);

    Optional<Invoice> findByIdAndUser(UUID id, User user);

    boolean existsByUserAndInvoiceNumber(User user, String invoiceNumber);

    long countByUser(User user);

    long countByUserAndStatus(User user, InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.user = :user AND i.status != 'CANCELLED' AND i.status != 'DRAFT'")
    BigDecimal sumTotalRevenue(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i WHERE i.user = :user AND i.status != 'CANCELLED'")
    BigDecimal sumAmountPaid(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(i.amountDue), 0) FROM Invoice i WHERE i.user = :user AND i.status != 'CANCELLED' AND i.status != 'DRAFT' AND i.status != 'PAID'")
    BigDecimal sumAmountDue(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(i.amountDue), 0) FROM Invoice i WHERE i.user = :user AND i.status = 'OVERDUE'")
    BigDecimal sumOverdueAmount(@Param("user") User user);

    @Query("SELECT i FROM Invoice i WHERE i.user = :user AND " +
           "(LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.customer.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.customer.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Invoice> searchInvoices(@Param("user") User user, @Param("query") String query);

    @Query("SELECT i FROM Invoice i WHERE i.user = :user AND i.invoiceDate BETWEEN :startDate AND :endDate ORDER BY i.invoiceDate ASC")
    List<Invoice> findByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
