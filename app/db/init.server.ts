import { db } from "./database.server";

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      seconds INTEGER NOT NULL DEFAULT 0,
      initial_seconds INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ready',
      ends_at INTEGER,

      CHECK (length(trim(name)) > 0),
      CHECK (seconds >= 0),
      CHECK (initial_seconds >= 0),
      CHECK (status IN ('ready', 'running', 'paused', 'completed'))
    );
  `);
}
