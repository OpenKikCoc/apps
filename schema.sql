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

-- AI Chat Tables
CREATE TABLE IF NOT EXISTS ai_sessions (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at INTEGER,
    FOREIGN KEY (session_id) REFERENCES ai_sessions(id) ON DELETE CASCADE
);

-- Indexes for AI Chat performance optimization
CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id ON ai_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_updated_at ON ai_sessions(updated_at);
