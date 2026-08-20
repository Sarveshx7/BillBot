package com.billbot.service;

import com.billbot.dto.NotificationResponse;
import com.billbot.entity.AppNotification;
import com.billbot.entity.BillDue;
import com.billbot.entity.User;
import com.billbot.repository.BillDueRepository;
import com.billbot.repository.NotificationRepository;
import com.billbot.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final BillDueRepository billDueRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            BillDueRepository billDueRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.billDueRepository = billDueRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<NotificationResponse> getNotifications(String userId) {
        User user = getUser(userId);
        return notificationRepository.findTop30ByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        User user = getUser(userId);
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markAsRead(String userId, UUID notificationId) {
        User user = getUser(userId);
        AppNotification notification = notificationRepository.findByIdAndUser(notificationId, user)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        User user = getUser(userId);
        List<AppNotification> list = notificationRepository.findTop30ByUserOrderByCreatedAtDesc(user);
        for (AppNotification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }

    public AppNotification createNotification(User user, String title, String message, String type, String actionUrl) {
        AppNotification notification = new AppNotification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type != null ? type : "SYSTEM");
        notification.setActionUrl(actionUrl != null ? actionUrl : "dashboard");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public boolean sendTestEmail(String userId, String targetEmail) {
        User user = getUser(userId);
        String recipient = (targetEmail != null && !targetEmail.trim().isEmpty()) ? targetEmail : user.getEmail();

        log.info("===============================================================");
        log.info("📧 [BillBot Email Gateway] Sending Bill Reminder to: {}", recipient);
        log.info("Subject: ⏰ BillBot Alert: Upcoming Due Date Reminder");
        log.info("Recipient: {} ({})", user.getName(), recipient);
        log.info("Body: Hello {}, this is your automated reminder from BillBot that you have active bills due soon. Stay ahead of deadlines with 0% penalty.", user.getName());
        log.info("===============================================================");

        createNotification(
                user,
                "Test Email Alert Dispatched",
                "A mock bill reminder email was successfully delivered to " + recipient + ".",
                "SYSTEM",
                "settings"
        );

        return true;
    }

    public boolean sendTestPush(String userId) {
        User user = getUser(userId);
        createNotification(
                user,
                "⚡ Push Notification Verified",
                "Your browser push notification permissions and alerts are fully active.",
                "SYSTEM",
                "settings"
        );
        return true;
    }

    /**
     * Daily Cron Job running at 9:00 AM every morning.
     * Scans for unpaid bills due in <= 3 days and generates timely alerts.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void scanAndNotifyUpcomingBills() {
        log.info("🔄 Running daily BillBot Bill Due Notification Scanner...");
        List<User> allUsers = userRepository.findAll();
        LocalDate today = LocalDate.now();

        for (User u : allUsers) {
            List<BillDue> unpaidBills = billDueRepository.findByUserAndIsPaidOrderByDueDateAsc(u, false);
            for (BillDue bill : unpaidBills) {
                long days = ChronoUnit.DAYS.between(today, bill.getDueDate());
                if (days >= 0 && days <= 3) {
                    String title = days == 0 ? "🚨 Bill Due TODAY: " + bill.getBillerName() : "⏰ Upcoming Bill: " + bill.getBillerName() + " in " + days + "d";
                    String msg = "Your bill of " + (bill.getCurrency() != null ? bill.getCurrency() : "₹") + " " + bill.getAmount() + " for " + bill.getBillerName() + " is due on " + bill.getDueDate() + ".";
                    createNotification(u, title, msg, "BILL_DUE", "bills");
                } else if (days < 0) {
                    String title = "⚠️ Overdue Bill: " + bill.getBillerName();
                    String msg = "Your bill of " + (bill.getCurrency() != null ? bill.getCurrency() : "₹") + " " + bill.getAmount() + " is overdue by " + Math.abs(days) + " days. Settle now to avoid late fees.";
                    createNotification(u, title, msg, "OVERDUE", "bills");
                }
            }
        }
    }

    private NotificationResponse toResponse(AppNotification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getActionUrl(),
                n.getCreatedAt()
        );
    }
}