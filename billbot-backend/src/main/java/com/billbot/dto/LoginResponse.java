package com.billbot.dto;

import com.billbot.entity.User;
import java.time.LocalDateTime;

public class LoginResponse {

    private String token;
    private String tokenType;
    private String userId;
    private String name;
    private String username;
    private String email;
    private String currency;
    private String timezone;
    private String businessName;
    private String businessPhone;
    private String businessAddress;
    private String taxNumber;
    private String invoicePrefix;
    private String invoiceNotesDefault;
    private String termsDefault;
    private LocalDateTime createdAt;

    public LoginResponse(String token, String tokenType, User user) {
        this.token = token;
        this.tokenType = tokenType;
        this.userId = user.getId().toString();
        this.name = user.getName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.currency = user.getCurrency();
        this.timezone = user.getTimezone();
        this.businessName = user.getBusinessName();
        this.businessPhone = user.getBusinessPhone();
        this.businessAddress = user.getBusinessAddress();
        this.taxNumber = user.getTaxNumber();
        this.invoicePrefix = user.getInvoicePrefix();
        this.invoiceNotesDefault = user.getInvoiceNotesDefault();
        this.termsDefault = user.getTermsDefault();
        this.createdAt = user.getCreatedAt();
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getCurrency() { return currency; }
    public String getTimezone() { return timezone; }
    public String getBusinessName() { return businessName; }
    public String getBusinessPhone() { return businessPhone; }
    public String getBusinessAddress() { return businessAddress; }
    public String getTaxNumber() { return taxNumber; }
    public String getInvoicePrefix() { return invoicePrefix; }
    public String getInvoiceNotesDefault() { return invoiceNotesDefault; }
    public String getTermsDefault() { return termsDefault; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
