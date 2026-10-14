import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Directory where our database will be stored
const dataDirectory = path.join(process.cwd(), "data");

// Create the directory if it doesn't exist
fs.mkdirSync(dataDirectory, { recursive: true });

// Path to the SQLite database file
const databasePath = path.join(dataDirectory, "countdown.db");

// Open the database connection
export const db = new Database(databasePath);

// Enable foreign key constraints
db.pragma("foreign_keys = ON");

// Improve concurrent read/write performance
db.pragma("journal_mode = WAL");
