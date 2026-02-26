import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'sales_crm.db');

let db;

function getDb() {
    if (db) return db;

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Auto-create tables on first run
    db.exec(`
        CREATE TABLE IF NOT EXISTS callers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT DEFAULT '',
            languages TEXT DEFAULT '[]',
            daily_lead_limit INTEGER DEFAULT 60,
            assigned_states TEXT DEFAULT '[]',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT DEFAULT '',
            timestamp TEXT DEFAULT (datetime('now')),
            lead_source TEXT DEFAULT '',
            city TEXT DEFAULT '',
            state TEXT DEFAULT '',
            metadata TEXT DEFAULT '',
            sheet_row_number INTEGER UNIQUE,
            assigned_caller_id TEXT REFERENCES callers(id) ON DELETE SET NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS round_robin_state (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state_key TEXT UNIQUE NOT NULL DEFAULT '__global__',
            last_caller_id TEXT REFERENCES callers(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS announcements (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS attendance (
            id TEXT PRIMARY KEY,
            caller_name TEXT NOT NULL,
            date TEXT DEFAULT (date('now')),
            status TEXT DEFAULT 'Present',
            UNIQUE(caller_name, date)
        );

        CREATE INDEX IF NOT EXISTS idx_leads_state ON leads(state);
        CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_caller_id);
        CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
        CREATE INDEX IF NOT EXISTS idx_leads_sheet_row ON leads(sheet_row_number);
    `);

    return db;
}

export default getDb;
