package com.billbot.repository;

import com.billbot.entity.BillDue;
import com.billbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillDueRepository extends JpaRepository<BillDue, UUID> {

    List<BillDue> findByUserOrderByDueDateAsc(User user);

    List<BillDue> findByUserAndIsPaidOrderByDueDateAsc(User user, boolean isPaid);

    Optional<BillDue> findByIdAndUser(UUID id, User user);

    @Query("SELECT b FROM BillDue b WHERE b.user = :user AND b.isPaid = false AND b.dueDate BETWEEN :start AND :end ORDER BY b.dueDate ASC")
    List<BillDue> findUpcomingDues(@Param("user") User user, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM BillDue b WHERE b.user = :user AND b.isPaid = false")
    BigDecimal sumTotalUnpaidDues(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM BillDue b WHERE b.user = :user AND b.isPaid = false AND b.dueDate <= :date")
    BigDecimal sumOverdueOrUpcomingDues(@Param("user") User user, @Param("date") LocalDate date);

    long countByUserAndIsPaid(User user, boolean isPaid);
}