package com.billbot.service;

import com.billbot.dto.*;
import com.billbot.entity.*;
import com.billbot.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    public InvoiceResponse createInvoice(InvoiceRequest request, String userId) {
        User user = getUser(userId);

        Customer customer = customerRepository.findByIdAndUser(request.customerId(), user)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + request.customerId()));

        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setCustomer(customer);
        invoice.setInvoiceDate(request.invoiceDate() != null ? request.invoiceDate() : LocalDate.now());
        invoice.setDueDate(request.dueDate() != null ? request.dueDate() : LocalDate.now().plusDays(15));
        invoice.setCurrency(request.currency() != null && !request.currency().isBlank() ? request.currency() : user.getCurrency());
        invoice.setNotes(request.notes() != null ? request.notes().trim() : user.getInvoiceNotesDefault());
        invoice.setTerms(request.terms() != null ? request.terms().trim() : user.getTermsDefault());

        // Invoice Number generation
        String invoiceNumber = request.invoiceNumber();
        if (invoiceNumber == null || invoiceNumber.isBlank()) {
            invoiceNumber = generateInvoiceNumber(user);
        } else {
            invoiceNumber = invoiceNumber.trim();
            if (invoiceRepository.existsByUserAndInvoiceNumber(user, invoiceNumber)) {
                throw new RuntimeException("Invoice number already exists: " + invoiceNumber);
            }
        }
        invoice.setInvoiceNumber(invoiceNumber);

        // Discount settings
        DiscountType discountType = request.discountType() != null ? request.discountType() : DiscountType.FIXED;
        BigDecimal discountValue = request.discountValue() != null ? request.discountValue() : BigDecimal.ZERO;
        invoice.setDiscountType(discountType);
        invoice.setDiscountValue(discountValue);

        // Process line items and compute totals
        processInvoiceItems(invoice, request.items(), user);

        // Initial status handling
        if (request.status() == InvoiceStatus.DRAFT) {
            invoice.setStatus(InvoiceStatus.DRAFT);
        } else {
            updateInvoiceStatusBasedOnDatesAndAmounts(invoice);
        }

        Invoice saved = invoiceRepository.save(invoice);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getUserInvoices(String userId) {
        User user = getUser(userId);
        List<Invoice> invoices = invoiceRepository.findByUserOrderByInvoiceDateDescCreatedAtDesc(user);
        invoices.forEach(this::checkAndSyncOverdueStatus);
        return invoices.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(UUID id, String userId) {
        User user = getUser(userId);
        Invoice invoice = invoiceRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
        checkAndSyncOverdueStatus(invoice);
        return mapToResponse(invoice);
    }

    public InvoiceResponse updateInvoice(UUID id, InvoiceRequest request, String userId) {
        User user = getUser(userId);
        Invoice invoice = invoiceRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        Customer customer = customerRepository.findByIdAndUser(request.customerId(), user)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + request.customerId()));

        invoice.setCustomer(customer);
        invoice.setInvoiceDate(request.invoiceDate());
        invoice.setDueDate(request.dueDate());
        if (request.currency() != null && !request.currency().isBlank()) {
            invoice.setCurrency(request.currency());
        }
        invoice.setNotes(request.notes() != null ? request.notes().trim() : null);
        invoice.setTerms(request.terms() != null ? request.terms().trim() : null);

        if (request.invoiceNumber() != null && !request.invoiceNumber().isBlank()) {
            String newNumber = request.invoiceNumber().trim();
            if (!newNumber.equalsIgnoreCase(invoice.getInvoiceNumber()) &&
                    invoiceRepository.existsByUserAndInvoiceNumber(user, newNumber)) {
                throw new RuntimeException("Invoice number already exists: " + newNumber);
            }
            invoice.setInvoiceNumber(newNumber);
        }

        DiscountType discountType = request.discountType() != null ? request.discountType() : DiscountType.FIXED;
        BigDecimal discountValue = request.discountValue() != null ? request.discountValue() : BigDecimal.ZERO;
        invoice.setDiscountType(discountType);
        invoice.setDiscountValue(discountValue);

        // Clear existing items and recalculate
        invoice.getItems().clear();
        processInvoiceItems(invoice, request.items(), user);

        if (request.status() != null) {
            invoice.setStatus(request.status());
        }
        updateInvoiceStatusBasedOnDatesAndAmounts(invoice);

        Invoice updated = invoiceRepository.save(invoice);
        return mapToResponse(updated);
    }

    public InvoiceResponse updateInvoiceStatus(UUID id, InvoiceStatus status, String userId) {
        User user = getUser(userId);
        Invoice invoice = invoiceRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        invoice.setStatus(status);
        if (status == InvoiceStatus.PAID) {
            invoice.setAmountPaid(invoice.getTotalAmount());
            invoice.setAmountDue(BigDecimal.ZERO);
        }

        Invoice updated = invoiceRepository.save(invoice);
        return mapToResponse(updated);
    }

    public void deleteInvoice(UUID id, String userId) {
        User user = getUser(userId);
        Invoice invoice = invoiceRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
        invoiceRepository.delete(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> searchInvoices(String query, String userId) {
        User user = getUser(userId);
        if (query == null || query.isBlank()) {
            return getUserInvoices(userId);
        }
        return invoiceRepository.searchInvoices(user, query.trim()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void processInvoiceItems(Invoice invoice, List<InvoiceItemRequest> itemRequests, User user) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;

        for (InvoiceItemRequest req : itemRequests) {
            InvoiceItem item = new InvoiceItem();
            item.setItemName(req.itemName().trim());
            item.setDescription(req.description() != null ? req.description().trim() : null);

            BigDecimal qty = req.quantity() != null && req.quantity().compareTo(BigDecimal.ZERO) > 0 ? req.quantity() : BigDecimal.ONE;
            BigDecimal price = req.unitPrice() != null && req.unitPrice().compareTo(BigDecimal.ZERO) >= 0 ? req.unitPrice() : BigDecimal.ZERO;
            BigDecimal taxRate = req.taxRate() != null && req.taxRate().compareTo(BigDecimal.ZERO) >= 0 ? req.taxRate() : BigDecimal.ZERO;
            BigDecimal discount = req.discountAmount() != null && req.discountAmount().compareTo(BigDecimal.ZERO) >= 0 ? req.discountAmount() : BigDecimal.ZERO;

            BigDecimal lineBase = qty.multiply(price).setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTax = lineBase.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = lineBase.add(lineTax).subtract(discount).setScale(2, RoundingMode.HALF_UP);
            if (lineTotal.compareTo(BigDecimal.ZERO) < 0) lineTotal = BigDecimal.ZERO;

            item.setQuantity(qty);
            item.setUnitPrice(price);
            item.setTaxRate(taxRate);
            item.setTaxAmount(lineTax);
            item.setDiscountAmount(discount);
            item.setTotalPrice(lineTotal);

            if (req.productId() != null) {
                productRepository.findByIdAndUser(req.productId(), user).ifPresent(item::setProduct);
            }

            invoice.addItem(item);
            subtotal = subtotal.add(lineBase);
            taxTotal = taxTotal.add(lineTax);
        }

        invoice.setSubtotal(subtotal);
        invoice.setTaxTotal(taxTotal);

        // Overall discount calculation
        BigDecimal discountTotal = BigDecimal.ZERO;
        if (invoice.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal percentage = invoice.getDiscountValue() != null ? invoice.getDiscountValue() : BigDecimal.ZERO;
            discountTotal = subtotal.multiply(percentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discountTotal = invoice.getDiscountValue() != null ? invoice.getDiscountValue() : BigDecimal.ZERO;
        }

        BigDecimal gross = subtotal.add(taxTotal);
        if (discountTotal.compareTo(gross) > 0) {
            discountTotal = gross;
        }
        invoice.setDiscountTotal(discountTotal);

        BigDecimal grandTotal = gross.subtract(discountTotal).setScale(2, RoundingMode.HALF_UP);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) grandTotal = BigDecimal.ZERO;
        invoice.setTotalAmount(grandTotal);

        BigDecimal paid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal due = grandTotal.subtract(paid).setScale(2, RoundingMode.HALF_UP);
        if (due.compareTo(BigDecimal.ZERO) < 0) due = BigDecimal.ZERO;
        invoice.setAmountDue(due);
    }

    private void updateInvoiceStatusBasedOnDatesAndAmounts(Invoice invoice) {
        if (invoice.getStatus() == InvoiceStatus.CANCELLED || invoice.getStatus() == InvoiceStatus.DRAFT) {
            return;
        }

        if (invoice.getTotalAmount().compareTo(BigDecimal.ZERO) > 0 &&
                invoice.getAmountPaid().compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoice.setAmountDue(BigDecimal.ZERO);
        } else if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        } else if (invoice.getDueDate() != null && invoice.getDueDate().isBefore(LocalDate.now())) {
            invoice.setStatus(InvoiceStatus.OVERDUE);
        } else {
            invoice.setStatus(InvoiceStatus.PENDING);
        }
    }

    private void checkAndSyncOverdueStatus(Invoice invoice) {
        if (invoice.getStatus() == InvoiceStatus.PENDING &&
                invoice.getDueDate() != null &&
                invoice.getDueDate().isBefore(LocalDate.now()) &&
                invoice.getAmountDue().compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.OVERDUE);
            invoiceRepository.save(invoice);
        }
    }

    public String generateInvoiceNumber(User user) {
        String prefix = user.getInvoicePrefix() != null && !user.getInvoicePrefix().isBlank() ? user.getInvoicePrefix().trim() : "INV";
        int year = LocalDate.now().getYear();
        long count = invoiceRepository.countByUser(user) + 1;
        String formattedNumber = String.format("%s-%d-%04d", prefix, year, count);

        // Guarantee uniqueness
        while (invoiceRepository.existsByUserAndInvoiceNumber(user, formattedNumber)) {
            count++;
            formattedNumber = String.format("%s-%d-%04d", prefix, year, count);
        }
        return formattedNumber;
    }

    public InvoiceResponse mapToResponse(Invoice invoice) {
        List<InvoiceItemResponse> itemResponses = invoice.getItems().stream()
                .map(item -> new InvoiceItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getItemName(),
                        item.getDescription(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTaxRate(),
                        item.getTaxAmount(),
                        item.getDiscountAmount(),
                        item.getTotalPrice()
                ))
                .toList();

        List<PaymentResponse> paymentResponses = invoice.getPayments().stream()
                .map(payment -> new PaymentResponse(
                        payment.getId(),
                        invoice.getId(),
                        invoice.getInvoiceNumber(),
                        invoice.getCustomer().getName(),
                        payment.getAmount(),
                        payment.getPaymentDate(),
                        payment.getPaymentMethod(),
                        payment.getTransactionReference(),
                        payment.getReceiptNumber(),
                        payment.getNotes(),
                        payment.getCreatedAt()
                ))
                .toList();

        Customer customer = invoice.getCustomer();
        String customerAddress = String.join(", ",
                java.util.stream.Stream.of(customer.getBillingAddress(), customer.getCity(), customer.getState(), customer.getPostalCode())
                        .filter(s -> s != null && !s.isBlank())
                        .toList()
        );

        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customerAddress,
                customer.getTaxNumber(),
                invoice.getInvoiceDate(),
                invoice.getDueDate(),
                invoice.getStatus(),
                invoice.getSubtotal(),
                invoice.getTaxTotal(),
                invoice.getDiscountType(),
                invoice.getDiscountValue(),
                invoice.getDiscountTotal(),
                invoice.getTotalAmount(),
                invoice.getAmountPaid(),
                invoice.getAmountDue(),
                invoice.getCurrency(),
                invoice.getNotes(),
                invoice.getTerms(),
                itemResponses,
                paymentResponses,
                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }
}
