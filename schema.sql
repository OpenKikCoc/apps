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

-- Pastebin Tables
CREATE TABLE IF NOT EXISTS pastes (
    id TEXT PRIMARY KEY,
    content TEXT,
    language TEXT,
    created_at INTEGER
);
