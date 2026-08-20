-- Migration V5: Create bill_dues and subscriptions tables

CREATE TABLE IF NOT EXISTS bill_dues (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    biller_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    due_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'BILLS',
    recurring_frequency VARCHAR(50) DEFAULT 'MONTHLY',
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_date DATE,
    auto_pay BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bill_dues_user ON bill_dues(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_dues_due_date ON bill_dues(due_date);
CREATE INDEX IF NOT EXISTS idx_bill_dues_is_paid ON bill_dues(is_paid);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
    next_billing_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'ENTERTAINMENT',
    auto_debit BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_date ON subscriptions(next_billing_date);