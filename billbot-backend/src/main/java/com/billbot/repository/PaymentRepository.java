package com.billbot.repository;

import com.billbot.entity.Invoice;
import com.billbot.entity.Payment;
import com.billbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByUserOrderByPaymentDateDescCreatedAtDesc(User user);

    List<Payment> findByInvoiceOrderByPaymentDateDesc(Invoice invoice);

    Optional<Payment> findByIdAndUser(UUID id, User user);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user = :user")
    BigDecimal sumTotalPayments(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice = :invoice")
    BigDecimal sumPaymentsForInvoice(@Param("invoice") Invoice invoice);
}
