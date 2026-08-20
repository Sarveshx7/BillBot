package com.billbot.controller;

import com.billbot.dto.*;
import com.billbot.service.BusinessDashboardService;
import com.billbot.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final BusinessDashboardService businessDashboardService;

    public DashboardController(
            DashboardService dashboardService,
            BusinessDashboardService businessDashboardService
    ) {
        this.dashboardService = dashboardService;
        this.businessDashboardService = businessDashboardService;
    }

    // =========================
    // PERSONAL FINANCE DASHBOARD
    // =========================

    @GetMapping("/personal-summary")
    public ResponseEntity<PersonalDashboardResponse> getPersonalDashboard(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(dashboardService.getPersonalDashboard(userId));
    }

    // =========================
    // EXPENSE STATS & ANALYTICS
    // =========================

    @GetMapping("/summary")
    public ResponseEntity<DashboardResponse> getDashboardSummary(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(dashboardService.getDashboardSummary(userId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategorySpendingResponse>> getCategorySpending(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(dashboardService.getCategorySpending(userId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<RecentExpenseResponse>> getRecentExpenses(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(dashboardService.getRecentExpenses(userId));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(dashboardService.getAnalytics(userId));
    }

    // =========================
    // BUSINESS DASHBOARD (OPTIONAL B2B INVOICES)
    // =========================

    @GetMapping("/business-summary")
    public ResponseEntity<BusinessDashboardResponse> getBusinessSummary(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(businessDashboardService.getDashboardSummary(userId));
    }
}