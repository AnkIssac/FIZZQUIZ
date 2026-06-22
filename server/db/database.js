import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = join(__dirname, 'fizzquiz.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    ensureSchema(db);
  }
  return db;
}

export function ensureSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      source TEXT NOT NULL,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct TEXT NOT NULL,
      explanation TEXT,
      image_url TEXT,
      audio_kind TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
    CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
    CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source);
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
