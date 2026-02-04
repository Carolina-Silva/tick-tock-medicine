import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('remedios.db');

export const setupDatabase = () => {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      photo_uri TEXT,
      interval_hours INTEGER NOT NULL,
      duration_days INTEGER NOT NULL,
      start_datetime TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dosages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medication_id INTEGER,
      scheduled_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY(medication_id) REFERENCES medications(id) ON DELETE CASCADE
    );
  `);
};

export default db;