package com.billbot.repository;

import com.billbot.entity.Expense;
import com.billbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByUserOrderByExpenseDateDesc(User user);

    Optional<Expense> findByIdAndUser(UUID id, User user);

    void deleteByIdAndUser(UUID id, User user);
}        