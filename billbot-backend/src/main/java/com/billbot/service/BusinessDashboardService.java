package com.billbot.service;

import com.billbot.dto.BusinessDashboardResponse;
import com.billbot.dto.InvoiceResponse;
import com.billbot.dto.InvoiceStatusDistributionResponse;
import com.billbot.dto.MonthlyRevenueResponse;
import com.billbot.entity.Invoice;
import com.billbot.entity.InvoiceStatus;
import com.billbot.entity.User;
import com.billbot.repository.CustomerRepository;
import com.billbot.repository.InvoiceRepository;
import com.billbot.repository.ProductRepository;
import com.billbot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BusinessDashboardService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InvoiceService invoiceService;

    public BusinessDashboardService(
            InvoiceRepository invoiceRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            InvoiceService invoiceService
    ) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.invoiceService = invoiceService;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    public BusinessDashboardResponse getDashboardSummary(String userId) {
        User user = getUser(userId);

        BigDecimal totalRevenue = invoiceRepository.sumTotalRevenue(user);
        BigDecimal totalPaid = invoiceRepository.sumAmountPaid(user);
        BigDecimal totalOutstanding = invoiceRepository.sumAmountDue(user);
        BigDecimal totalOverdue = invoiceRepository.sumOverdueAmount(user);

        long totalInvoices = invoiceRepository.countByUser(user);
        long paidInvoicesCount = invoiceRepository.countByUserAndStatus(user, InvoiceStatus.PAID);
        long pendingInvoicesCount = invoiceRepository.countByUserAndStatus(user, InvoiceStatus.PENDING) +
                invoiceRepository.countByUserAndStatus(user, InvoiceStatus.PARTIALLY_PAID);
        long overdueInvoicesCount = invoiceRepository.countByUserAndStatus(user, InvoiceStatus.OVERDUE);

        long totalCustomers = customerRepository.countByUser(user);
        long totalProducts = productRepository.countByUser(user);

        List<Invoice> recentInvoices = invoiceRepository.findByUserOrderByInvoiceDateDescCreatedAtDesc(user)
                .stream()
                .limit(6)
                .toList();

        List<InvoiceResponse> recentResponses = recentInvoices.stream()
                .map(invoiceService::mapToResponse)
                .toList();

        List<MonthlyRevenueResponse> monthlyRevenue = calculateMonthlyRevenue(user);
        List<InvoiceStatusDistributionResponse> statusDistribution = calculateStatusDistribution(user, totalInvoices);

        return new BusinessDashboardResponse(
                totalRevenue,
                totalPaid,
                totalOutstanding,
                totalOverdue,
                totalInvoices,
                paidInvoicesCount,
                pendingInvoicesCount,
                overdueInvoicesCount,
                totalCustomers,
                totalProducts,
                recentResponses,
                monthlyRevenue,
                statusDistribution
        );
    }

    private List<MonthlyRevenueResponse> calculateMonthlyRevenue(User user) {
        LocalDate startDate = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        LocalDate endDate = LocalDate.now().plusDays(1);

        List<Invoice> invoices = invoiceRepository.findByUserAndDateRange(user, startDate, endDate);

        Map<YearMonth, List<Invoice>> grouped = invoices.stream()
                .filter(inv -> inv.getStatus() != InvoiceStatus.CANCELLED && inv.getStatus() != InvoiceStatus.DRAFT)
                .collect(Collectors.groupingBy(inv -> YearMonth.from(inv.getInvoiceDate())));

        List<MonthlyRevenueResponse> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            List<Invoice> monthInvoices = grouped.getOrDefault(ym, Collections.emptyList());

            BigDecimal rev = monthInvoices.stream()
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal paid = monthInvoices.stream()
                    .map(Invoice::getAmountPaid)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(new MonthlyRevenueResponse(
                    ym.format(formatter),
                    rev,
                    paid,
                    monthInvoices.size()
            ));
        }

        return result;
    }

    private List<InvoiceStatusDistributionResponse> calculateStatusDistribution(User user, long totalCount) {
        List<InvoiceStatusDistributionResponse> list = new ArrayList<>();
        if (totalCount == 0) {
            return list;
        }

        for (InvoiceStatus status : InvoiceStatus.values()) {
            long count = invoiceRepository.countByUserAndStatus(user, status);
            if (count > 0) {
                double pct = Math.round(((double) count / totalCount * 100) * 10.0) / 10.0;
                list.add(new InvoiceStatusDistributionResponse(status.name(), count, pct));
            }
        }

        return list;
    }
}
