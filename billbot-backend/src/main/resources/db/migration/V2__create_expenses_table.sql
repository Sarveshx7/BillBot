CREATE TABLE expenses (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    merchant VARCHAR(255) NOT NULL,

    amount DECIMAL(12, 2) NOT NULL,

    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    expense_date TIMESTAMP NOT NULL,

    category VARCHAR(50) NOT NULL,

    payment_method VARCHAR(50),

    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',

    notes TEXT,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_expenses_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);