package com.billbot.service;

import com.billbot.dto.ExpenseRequest;
import com.billbot.dto.ExpenseResponse;
import com.billbot.entity.Expense;
import com.billbot.entity.User;
import com.billbot.repository.ExpenseRepository;
import com.billbot.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            UserRepository userRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // CREATE EXPENSE
    // =========================

    public ExpenseResponse createExpense(
            ExpenseRequest request,
            String userId
    ) {

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Expense expense = new Expense();

        expense.setUser(user);
        expense.setMerchant(request.getMerchant());
        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency());
        expense.setCategory(request.getCategory());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setSource(request.getSource());
        expense.setNotes(request.getNotes());

        if (request.getExpenseDate() != null) {
            expense.setExpenseDate(request.getExpenseDate());
        } else {
            expense.setExpenseDate(LocalDateTime.now());
        }

        Expense savedExpense = expenseRepository.save(expense);

        return mapToResponse(savedExpense);
    }


    // =========================
    // GET ALL USER EXPENSES
    // =========================

    public List<ExpenseResponse> getUserExpenses(String userId) {

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return expenseRepository
                .findByUserOrderByExpenseDateDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================
    // GET SINGLE EXPENSE
    // =========================

    public ExpenseResponse getExpense(
            UUID expenseId,
            String userId
    ) {

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Expense expense = expenseRepository
                .findByIdAndUser(expenseId, user)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found")
                );

        return mapToResponse(expense);
    }


    // =========================
    // UPDATE EXPENSE
    // =========================

    public ExpenseResponse updateExpense(
            UUID expenseId,
            ExpenseRequest request,
            String userId
    ) {

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Expense expense = expenseRepository
                .findByIdAndUser(expenseId, user)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found")
                );

        expense.setMerchant(request.getMerchant());
        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency());
        expense.setCategory(request.getCategory());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setSource(request.getSource());
        expense.setNotes(request.getNotes());

        if (request.getExpenseDate() != null) {
            expense.setExpenseDate(request.getExpenseDate());
        }

        Expense updatedExpense = expenseRepository.save(expense);

        return mapToResponse(updatedExpense);
    }


    // =========================
    // DELETE EXPENSE
    // =========================

    public void deleteExpense(
            UUID expenseId,
            String userId
    ) {

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Expense expense = expenseRepository
                .findByIdAndUser(expenseId, user)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found")
                );

        expenseRepository.delete(expense);
    }


    // =========================
    // ENTITY → RESPONSE
    // =========================

    private ExpenseResponse mapToResponse(Expense expense) {

        return new ExpenseResponse(
                expense.getId(),
                expense.getMerchant(),
                expense.getAmount(),
                expense.getCurrency(),
                expense.getExpenseDate(),
                expense.getCategory(),
                expense.getPaymentMethod(),
                expense.getSource(),
                expense.getNotes(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }
}