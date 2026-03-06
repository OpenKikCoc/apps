-- Medician Tables
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT,
    brand TEXT,
    quantity INTEGER,
    unit TEXT,
    expiry_date TEXT,
    dosage TEXT,
    indications TEXT,
    image_path TEXT,
    created_at INTEGER
);

CREATE TABLE IF NOT EXISTS memos (
    id TEXT PRIMARY KEY,
    content TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

-- Pastebin Tables
CREATE TABLE IF NOT EXISTS pastes (
    id TEXT PRIMARY KEY,
    content TEXT,
    language TEXT,
    created_at INTEGER
);

-- Subscriptions Tables
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'CNY',
    billing_cycle TEXT NOT NULL, -- 'monthly', 'yearly', 'weekly', 'onetime'
    start_date TEXT NOT NULL,    -- YYYY-MM-DD
    category TEXT,               -- 'entertainment', 'utility', 'software', 'insurance', 'other'
    description TEXT,
    active INTEGER DEFAULT 1,    -- 1=active, 0=inactive
    created_at INTEGER
);
