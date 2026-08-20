package com.billbot.service;

import com.billbot.dto.CustomerRequest;
import com.billbot.dto.CustomerResponse;
import com.billbot.entity.Customer;
import com.billbot.entity.Invoice;
import com.billbot.entity.User;
import com.billbot.repository.CustomerRepository;
import com.billbot.repository.InvoiceRepository;
import com.billbot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            InvoiceRepository invoiceRepository,
            UserRepository userRepository
    ) {
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    public CustomerResponse createCustomer(CustomerRequest request, String userId) {
        User user = getUser(userId);

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setName(request.name().trim());
        customer.setEmail(request.email() != null ? request.email().trim() : null);
        customer.setPhone(request.phone() != null ? request.phone().trim() : null);
        customer.setCompanyName(request.companyName() != null ? request.companyName().trim() : null);
        customer.setBillingAddress(request.billingAddress() != null ? request.billingAddress().trim() : null);
        customer.setShippingAddress(request.shippingAddress() != null ? request.shippingAddress().trim() : null);
        customer.setCity(request.city() != null ? request.city().trim() : null);
        customer.setState(request.state() != null ? request.state().trim() : null);
        customer.setPostalCode(request.postalCode() != null ? request.postalCode().trim() : null);
        customer.setTaxNumber(request.taxNumber() != null ? request.taxNumber().trim() : null);
        customer.setNotes(request.notes() != null ? request.notes().trim() : null);

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved, user);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getUserCustomers(String userId) {
        User user = getUser(userId);
        List<Customer> customers = customerRepository.findByUserOrderByCreatedAtDesc(user);
        return customers.stream()
                .map(customer -> mapToResponse(customer, user))
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomer(UUID id, String userId) {
        User user = getUser(userId);
        Customer customer = customerRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        return mapToResponse(customer, user);
    }

    public CustomerResponse updateCustomer(UUID id, CustomerRequest request, String userId) {
        User user = getUser(userId);
        Customer customer = customerRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));

        customer.setName(request.name().trim());
        customer.setEmail(request.email() != null ? request.email().trim() : null);
        customer.setPhone(request.phone() != null ? request.phone().trim() : null);
        customer.setCompanyName(request.companyName() != null ? request.companyName().trim() : null);
        customer.setBillingAddress(request.billingAddress() != null ? request.billingAddress().trim() : null);
        customer.setShippingAddress(request.shippingAddress() != null ? request.shippingAddress().trim() : null);
        customer.setCity(request.city() != null ? request.city().trim() : null);
        customer.setState(request.state() != null ? request.state().trim() : null);
        customer.setPostalCode(request.postalCode() != null ? request.postalCode().trim() : null);
        customer.setTaxNumber(request.taxNumber() != null ? request.taxNumber().trim() : null);
        customer.setNotes(request.notes() != null ? request.notes().trim() : null);

        Customer updated = customerRepository.save(customer);
        return mapToResponse(updated, user);
    }

    public void deleteCustomer(UUID id, String userId) {
        User user = getUser(userId);
        Customer customer = customerRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));

        List<Invoice> invoices = invoiceRepository.findByUserAndCustomerOrderByInvoiceDateDesc(user, customer);
        if (!invoices.isEmpty()) {
            throw new RuntimeException("Cannot delete customer with associated invoices. Please delete or reassign invoices first.");
        }

        customerRepository.delete(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(String query, String userId) {
        User user = getUser(userId);
        if (query == null || query.isBlank()) {
            return getUserCustomers(userId);
        }
        return customerRepository.searchCustomers(user, query.trim()).stream()
                .map(customer -> mapToResponse(customer, user))
                .toList();
    }

    public CustomerResponse mapToResponse(Customer customer, User user) {
        List<Invoice> invoices = invoiceRepository.findByUserAndCustomerOrderByInvoiceDateDesc(user, customer);
        long count = invoices.size();
        BigDecimal totalBilled = invoices.stream()
                .filter(inv -> !"CANCELLED".equals(inv.getStatus().name()) && !"DRAFT".equals(inv.getStatus().name()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = invoices.stream()
                .filter(inv -> !"CANCELLED".equals(inv.getStatus().name()))
                .map(Invoice::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = invoices.stream()
                .filter(inv -> !"CANCELLED".equals(inv.getStatus().name()) && !"DRAFT".equals(inv.getStatus().name()) && !"PAID".equals(inv.getStatus().name()))
                .map(Invoice::getAmountDue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getCompanyName(),
                customer.getBillingAddress(),
                customer.getShippingAddress(),
                customer.getCity(),
                customer.getState(),
                customer.getPostalCode(),
                customer.getTaxNumber(),
                customer.getNotes(),
                count,
                totalBilled,
                totalPaid,
                balance,
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
