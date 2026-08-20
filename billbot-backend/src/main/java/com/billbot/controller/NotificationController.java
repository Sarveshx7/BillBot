package com.billbot.controller;

import com.billbot.dto.NotificationResponse;
import com.billbot.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        String userId = authentication.getName();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        notificationService.markAsRead(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String userId = authentication.getName();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/test-email")
    public ResponseEntity<Map<String, Object>> sendTestEmail(
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        String email = body != null ? body.get("email") : null;
        boolean success = notificationService.sendTestEmail(userId, email);
        return ResponseEntity.ok(Map.of("success", success, "message", "Test reminder email dispatched."));
    }

    @PostMapping("/test-push")
    public ResponseEntity<Map<String, Object>> sendTestPush(Authentication authentication) {
        String userId = authentication.getName();
        boolean success = notificationService.sendTestPush(userId);
        return ResponseEntity.ok(Map.of("success", success, "message", "Test push notification dispatched."));
    }
}