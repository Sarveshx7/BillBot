package com.billbot.service;

import com.billbot.dto.PaymentRequest;
import com.billbot.dto.PaymentResponse;
import com.billbot.entity.Invoice;
import com.billbot.entity.InvoiceStatus;
import com.billbot.entity.Payment;
import com.billbot.entity.User;
import com.billbot.repository.InvoiceRepository;
import com.billbot.repository.PaymentRepository;
import com.billbot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    public PaymentResponse recordPayment(PaymentRequest request, String userId) {
        User user = getUser(userId);

        Invoice invoice = invoiceRepository.findByIdAndUser(request.invoiceId(), user)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + request.invoiceId()));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new RuntimeException("Cannot record payment for a cancelled invoice");
        }

        BigDecimal paymentAmount = request.amount().setScale(2, RoundingMode.HALF_UP);
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setInvoice(invoice);
        payment.setAmount(paymentAmount);
        payment.setPaymentDate(request.paymentDate() != null ? request.paymentDate() : LocalDate.now());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setTransactionReference(request.transactionReference() != null ? request.transactionReference().trim() : null);
        payment.setNotes(request.notes() != null ? request.notes().trim() : null);
        payment.setReceiptNumber("REC-" + System.currentTimeMillis());

        Payment saved = paymentRepository.save(payment);

        // Update Invoice financial state
        BigDecimal currentPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal newPaid = currentPaid.add(paymentAmount).setScale(2, RoundingMode.HALF_UP);
        invoice.setAmountPaid(newPaid);

        BigDecimal remaining = invoice.getTotalAmount().subtract(newPaid).setScale(2, RoundingMode.HALF_UP);
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setAmountDue(BigDecimal.ZERO);
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setAmountDue(remaining);
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        invoiceRepository.save(invoice);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getUserPayments(String userId) {
        User user = getUser(userId);
        return paymentRepository.findByUserOrderByPaymentDateDescCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getInvoicePayments(UUID invoiceId, String userId) {
        User user = getUser(userId);
        Invoice invoice = invoiceRepository.findByIdAndUser(invoiceId, user)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));
        return paymentRepository.findByInvoiceOrderByPaymentDateDesc(invoice).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void deletePayment(UUID paymentId, String userId) {
        User user = getUser(userId);
        Payment payment = paymentRepository.findByIdAndUser(paymentId, user)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        Invoice invoice = payment.getInvoice();
        BigDecimal newPaid = invoice.getAmountPaid().subtract(payment.getAmount()).setScale(2, RoundingMode.HALF_UP);
        if (newPaid.compareTo(BigDecimal.ZERO) < 0) newPaid = BigDecimal.ZERO;
        invoice.setAmountPaid(newPaid);

        BigDecimal remaining = invoice.getTotalAmount().subtract(newPaid).setScale(2, RoundingMode.HALF_UP);
        invoice.setAmountDue(remaining);

        if (newPaid.compareTo(BigDecimal.ZERO) == 0) {
            if (invoice.getDueDate() != null && invoice.getDueDate().isBefore(LocalDate.now())) {
                invoice.setStatus(InvoiceStatus.OVERDUE);
            } else {
                invoice.setStatus(InvoiceStatus.PENDING);
            }
        } else if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PAID);
        }

        paymentRepository.delete(payment);
        invoiceRepository.save(invoice);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getInvoice().getId(),
                payment.getInvoice().getInvoiceNumber(),
                payment.getInvoice().getCustomer().getName(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getPaymentMethod(),
                payment.getTransactionReference(),
                payment.getReceiptNumber(),
                payment.getNotes(),
                payment.getCreatedAt()
        );
    }
}
