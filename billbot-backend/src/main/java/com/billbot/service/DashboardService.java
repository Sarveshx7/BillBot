package com.billbot.service;

import com.billbot.dto.*;
import com.billbot.entity.BillDue;
import com.billbot.entity.Expense;
import com.billbot.entity.Subscription;
import com.billbot.entity.User;
import com.billbot.repository.BillDueRepository;
import com.billbot.repository.ExpenseRepository;
import com.billbot.repository.SubscriptionRepository;
import com.billbot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final BillDueRepository billDueRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final BillDueService billDueService;
    private final SubscriptionService subscriptionService;

    public DashboardService(
            ExpenseRepository expenseRepository,
            BillDueRepository billDueRepository,
            SubscriptionRepository subscriptionRepository,
            UserRepository userRepository,
            BillDueService billDueService,
            SubscriptionService subscriptionService
    ) {
        this.expenseRepository = expenseRepository;
        this.billDueRepository = billDueRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.billDueService = billDueService;
        this.subscriptionService = subscriptionService;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public PersonalDashboardResponse getPersonalDashboard(String userId) {
        User user = getUser(userId);

        // 1. Current Month & Last Month Spent
        YearMonth currentYm = YearMonth.now();
        YearMonth lastYm = currentYm.minusMonths(1);

        LocalDateTime currentMonthStart = currentYm.atDay(1).atStartOfDay();
        LocalDateTime nextMonthStart = currentYm.plusMonths(1).atDay(1).atStartOfDay();
        LocalDateTime lastMonthStart = lastYm.atDay(1).atStartOfDay();

        List<Expense> allExpenses = expenseRepository.findByUserOrderByExpenseDateDesc(user);

        BigDecimal thisMonthSpent = allExpenses.stream()
                .filter(e -> !e.getExpenseDate().isBefore(currentMonthStart) && e.getExpenseDate().isBefore(nextMonthStart))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lastMonthSpent = allExpenses.stream()
                .filter(e -> !e.getExpenseDate().isBefore(lastMonthStart) && e.getExpenseDate().isBefore(currentMonthStart))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal changePercent = BigDecimal.ZERO;
        if (lastMonthSpent.compareTo(BigDecimal.ZERO) > 0) {
            changePercent = thisMonthSpent.subtract(lastMonthSpent)
                    .divide(lastMonthSpent, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
        }

        // 2. Upcoming Dues
        BigDecimal totalUnpaidDues = billDueRepository.sumTotalUnpaidDues(user);
        long upcomingDuesCount = billDueRepository.countByUserAndIsPaid(user, false);
        List<BillDueResponse> upcomingDues = billDueRepository.findByUserAndIsPaidOrderByDueDateAsc(user, false)
                .stream()
                .limit(6)
                .map(billDueService::mapToResponse)
                .toList();

        // 3. Subscriptions Burn Rate
        List<Subscription> activeSubs = subscriptionRepository.findActiveSubscriptions(user);
        BigDecimal monthlyBurnRate = activeSubs.stream()
                .map(s -> {
                    BigDecimal amt = s.getAmount();
                    if ("YEARLY".equalsIgnoreCase(s.getBillingCycle())) {
                        return amt.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
                    } else if ("QUARTERLY".equalsIgnoreCase(s.getBillingCycle())) {
                        return amt.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
                    } else if ("WEEKLY".equalsIgnoreCase(s.getBillingCycle())) {
                        return amt.multiply(BigDecimal.valueOf(4.33)).setScale(2, RoundingMode.HALF_UP);
                    }
                    return amt;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SubscriptionResponse> activeSubResponses = activeSubs.stream()
                .map(subscriptionService::mapToResponse)
                .toList();

        // 4. Recent Expenses
        List<RecentExpenseResponse> recentExpenses = allExpenses.stream()
                .limit(6)
                .map(e -> new RecentExpenseResponse(
                        e.getId(),
                        e.getMerchant(),
                        e.getAmount(),
                        e.getCategory(),
                        e.getExpenseDate()
                ))
                .toList();

        // 5. Category Spending
        List<CategorySpendingResponse> categorySpending = getCategorySpending(userId);

        // 6. Monthly Spending Trend (Last 6 months)
        List<MonthlySpendingResponse> monthlyTrend = getMonthlySpendingTrend(user, allExpenses);

        return new PersonalDashboardResponse(
                thisMonthSpent,
                lastMonthSpent,
                changePercent,
                totalUnpaidDues != null ? totalUnpaidDues : BigDecimal.ZERO,
                upcomingDuesCount,
                monthlyBurnRate,
                activeSubs.size(),
                allExpenses.size(),
                recentExpenses,
                upcomingDues,
                activeSubResponses,
                categorySpending,
                monthlyTrend
        );
    }

    public DashboardResponse getDashboardSummary(String userId) {
        User user = getUser(userId);
        List<Expense> allExpenses = expenseRepository.findByUserOrderByExpenseDateDesc(user);

        BigDecimal totalSpent = allExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        YearMonth currentYm = YearMonth.now();
        LocalDateTime currentMonthStart = currentYm.atDay(1).atStartOfDay();
        BigDecimal thisMonth = allExpenses.stream()
                .filter(e -> !e.getExpenseDate().isBefore(currentMonthStart))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> catTotals = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        String topCategory = catTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        return new DashboardResponse(totalSpent, thisMonth, allExpenses.size(), topCategory);
    }

    public List<CategorySpendingResponse> getCategorySpending(String userId) {
        User user = getUser(userId);
        List<Expense> allExpenses = expenseRepository.findByUserOrderByExpenseDateDesc(user);

        BigDecimal grandTotal = allExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, List<Expense>> grouped = allExpenses.stream()
                .collect(Collectors.groupingBy(Expense::getCategory));

        List<CategorySpendingResponse> list = new ArrayList<>();
        grouped.forEach((category, items) -> {
            BigDecimal catTotal = items.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double pct = 0.0;
            if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                pct = catTotal.divide(grandTotal, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
                pct = Math.round(pct * 10.0) / 10.0;
            }

            list.add(new CategorySpendingResponse(category, catTotal, pct, items.size()));
        });

        list.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        return list;
    }

    public List<RecentExpenseResponse> getRecentExpenses(String userId) {
        User user = getUser(userId);
        return expenseRepository.findByUserOrderByExpenseDateDesc(user)
                .stream()
                .limit(10)
                .map(e -> new RecentExpenseResponse(
                        e.getId(),
                        e.getMerchant(),
                        e.getAmount(),
                        e.getCategory(),
                        e.getExpenseDate()
                ))
                .toList();
    }

    public AnalyticsResponse getAnalytics(String userId) {
        User user = getUser(userId);
        List<Expense> allExpenses = expenseRepository.findByUserOrderByExpenseDateDesc(user);

        BigDecimal totalSpent = allExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgExpense = BigDecimal.ZERO;
        if (!allExpenses.isEmpty()) {
            avgExpense = totalSpent.divide(BigDecimal.valueOf(allExpenses.size()), 2, RoundingMode.HALF_UP);
        }

        BigDecimal highestExpense = allExpenses.stream()
                .map(Expense::getAmount)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        List<MonthlySpendingResponse> monthlyTrend = getMonthlySpendingTrend(user, allExpenses);
        List<CategorySpendingResponse> categorySpending = getCategorySpending(userId);

        return new AnalyticsResponse(
                totalSpent,
                avgExpense,
                highestExpense,
                allExpenses.size(),
                monthlyTrend,
                categorySpending
        );
    }

    private List<MonthlySpendingResponse> getMonthlySpendingTrend(User user, List<Expense> expenses) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        List<MonthlySpendingResponse> result = new ArrayList<>();

        Map<YearMonth, List<Expense>> grouped = expenses.stream()
                .collect(Collectors.groupingBy(e -> YearMonth.from(e.getExpenseDate())));

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            List<Expense> monthItems = grouped.getOrDefault(ym, Collections.emptyList());

            BigDecimal total = monthItems.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(new MonthlySpendingResponse(
                    ym.format(formatter),
                    total,
                    monthItems.size()
            ));
        }

        return result;
    }
}