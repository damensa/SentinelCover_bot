import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define the UserState interface to match your application's state structure
export interface UserSession {
    mode: string;
    step: number;
    data: any;
}

class DBService {
    private db: Database.Database;

    constructor() {
        const dbPath = path.join(process.cwd(), 'sentinel.db');
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        // 1. Subscribers Table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS subscribers (
                whatsapp_id TEXT PRIMARY KEY,
                name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1
            )
        `);

        // 2. User Sessions Table (Stored as stringified JSON)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                whatsapp_id TEXT PRIMARY KEY,
                mode TEXT,
                step INTEGER,
                data TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (whatsapp_id) REFERENCES subscribers(whatsapp_id)
            )
        `);

        // 3. Message Logs Table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS message_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                whatsapp_id TEXT,
                message_text TEXT,
                role TEXT, -- 'user' or 'bot'
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (whatsapp_id) REFERENCES subscribers(whatsapp_id)
            )
        `);

        console.log('[DB] SQLite Database Initialized.');
    }

    // --- Subscriber Methods ---

    isSubscriber(whatsappId: string): boolean {
        const row = this.db.prepare('SELECT 1 FROM subscribers WHERE whatsapp_id = ? AND is_active = 1').get(whatsappId);
        return !!row;
    }

    addSubscriber(whatsappId: string, name?: string) {
        this.db.prepare('INSERT OR REPLACE INTO subscribers (whatsapp_id, name) VALUES (?, ?)').run(whatsappId, name || null);
    }

    // --- Session Methods ---

    getSession(whatsappId: string): UserSession | null {
        const row = this.db.prepare('SELECT mode, step, data FROM user_sessions WHERE whatsapp_id = ?').get(whatsappId) as any;
        if (!row) return null;

        return {
            mode: row.mode,
            step: row.step,
            data: JSON.parse(row.data)
        };
    }

    saveSession(whatsappId: string, session: UserSession) {
        this.db.prepare(`
            INSERT OR REPLACE INTO user_sessions (whatsapp_id, mode, step, data, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(whatsappId, session.mode, session.step, JSON.stringify(session.data));
    }

    clearSession(whatsappId: string) {
        this.db.prepare('DELETE FROM user_sessions WHERE whatsapp_id = ?').run(whatsappId);
    }

    // --- Logging Methods ---

    logMessage(whatsappId: string, text: string, role: 'user' | 'bot') {
        this.db.prepare('INSERT INTO message_logs (whatsapp_id, message_text, role) VALUES (?, ?, ?)').run(whatsappId, text, role);
    }
}

export const dbService = new DBService();
