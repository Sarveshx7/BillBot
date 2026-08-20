package com.billbot.service;

import com.billbot.dto.BillDueRequest;
import com.billbot.dto.BillDueResponse;
import com.billbot.entity.BillDue;
import com.billbot.entity.Expense;
import com.billbot.entity.User;
import com.billbot.repository.BillDueRepository;
import com.billbot.repository.ExpenseRepository;
import com.billbot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BillDueService {

    private final BillDueRepository billDueRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public BillDueService(
            BillDueRepository billDueRepository,
            ExpenseRepository expenseRepository,
            UserRepository userRepository
    ) {
        this.billDueRepository = billDueRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<BillDueResponse> getAll(String userId, Boolean isPaid) {
        User user = getUser(userId);
        List<BillDue> list;
        if (isPaid != null) {
            list = billDueRepository.findByUserAndIsPaidOrderByDueDateAsc(user, isPaid);
        } else {
            list = billDueRepository.findByUserOrderByDueDateAsc(user);
        }
        return list.stream().map(this::mapToResponse).toList();
    }

    public BillDueResponse getById(UUID id, String userId) {
        User user = getUser(userId);
        BillDue bill = billDueRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Bill due entry not found"));
        return mapToResponse(bill);
    }

    public BillDueResponse create(BillDueRequest request, String userId) {
        User user = getUser(userId);

        BillDue bill = new BillDue();
        bill.setUser(user);
        bill.setBillerName(request.getBillerName().trim());
        bill.setAmount(request.getAmount());
        bill.setCurrency(request.getCurrency() != null ? request.getCurrency() : user.getCurrency());
        bill.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(7));
        bill.setCategory(request.getCategory() != null ? request.getCategory().trim().toUpperCase() : "BILLS");
        bill.setRecurringFrequency(request.getRecurringFrequency() != null ? request.getRecurringFrequency().trim().toUpperCase() : "MONTHLY");
        bill.setAutoPay(request.isAutoPay());
        bill.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        bill.setPaid(false);

        BillDue saved = billDueRepository.save(bill);
        return mapToResponse(saved);
    }

    public BillDueResponse update(UUID id, BillDueRequest request, String userId) {
        User user = getUser(userId);
        BillDue bill = billDueRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Bill due entry not found"));

        bill.setBillerName(request.getBillerName().trim());
        bill.setAmount(request.getAmount());
        if (request.getCurrency() != null) bill.setCurrency(request.getCurrency());
        if (request.getDueDate() != null) bill.setDueDate(request.getDueDate());
        if (request.getCategory() != null) bill.setCategory(request.getCategory().trim().toUpperCase());
        if (request.getRecurringFrequency() != null) bill.setRecurringFrequency(request.getRecurringFrequency().trim().toUpperCase());
        bill.setAutoPay(request.isAutoPay());
        bill.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        BillDue saved = billDueRepository.save(bill);
        return mapToResponse(saved);
    }

    public BillDueResponse markAsPaid(UUID id, boolean autoCreateExpense, String userId) {
        User user = getUser(userId);
        BillDue bill = billDueRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Bill due entry not found"));

        bill.setPaid(true);
        bill.setPaidDate(LocalDate.now());

        // Optionally record an expense automatically
        if (autoCreateExpense) {
            Expense expense = new Expense();
            expense.setUser(user);
            expense.setMerchant(bill.getBillerName());
            expense.setAmount(bill.getAmount());
            expense.setCurrency(bill.getCurrency());
            expense.setCategory(bill.getCategory());
            expense.setPaymentMethod("UPI");
            expense.setSource("BILL_DUE");
            expense.setNotes("Settlement for upcoming bill: " + bill.getBillerName());
            expense.setExpenseDate(LocalDateTime.now());
            expenseRepository.save(expense);
        }

        BillDue saved = billDueRepository.save(bill);
        return mapToResponse(saved);
    }

    public void delete(UUID id, String userId) {
        User user = getUser(userId);
        BillDue bill = billDueRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Bill due entry not found"));
        billDueRepository.delete(bill);
    }

    public BillDueResponse mapToResponse(BillDue b) {
        long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), b.getDueDate());
        boolean isOverdue = !b.isPaid() && b.getDueDate().isBefore(LocalDate.now());

        return new BillDueResponse(
                b.getId(),
                b.getBillerName(),
                b.getAmount(),
                b.getCurrency(),
                b.getDueDate(),
                b.getCategory(),
                b.getRecurringFrequency(),
                b.isPaid(),
                b.getPaidDate(),
                b.isAutoPay(),
                b.getNotes(),
                daysUntilDue,
                isOverdue,
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }
}