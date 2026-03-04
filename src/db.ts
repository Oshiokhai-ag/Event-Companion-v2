import Database from 'better-sqlite3';
import path from 'path';

// ✅ Absolute path prevents "file not found" when cwd differs
const DB_PATH = path.join(process.cwd(), 'companion.db');
console.log(`[DB] Database path: ${DB_PATH}`);

// ✅ This line CREATES the file if it doesn't exist
export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      profile_photo_url TEXT,
      bio TEXT,
      interests TEXT DEFAULT '[]',
      phone_verified INTEGER DEFAULT 0,
      location_city TEXT,
      lat REAL,
      lng REAL,
      discovery_radius INTEGER DEFAULT 50,
      google_id TEXT UNIQUE,
      fcm_token TEXT,
      average_rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      join_date TEXT DEFAULT CURRENT_TIMESTAMP,
      account_status TEXT DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      organizer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      event_type TEXT NOT NULL,
      cover_photos TEXT DEFAULT '[]',
      date_time TEXT NOT NULL,
      lat REAL,
      lng REAL,
      general_area TEXT,
      description TEXT,
      max_companions INTEGER DEFAULT 1,
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS join_requests (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      requester_id TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      resolved_at TEXT,
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (requester_id) REFERENCES users(id),
      UNIQUE(event_id, requester_id)
    );

    CREATE TABLE IF NOT EXISTS chat_threads (
      id TEXT PRIMARY KEY,
      request_id TEXT UNIQUE NOT NULL,
      event_id TEXT NOT NULL,
      organizer_id TEXT NOT NULL,
      participant_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES join_requests(id),
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (organizer_id) REFERENCES users(id),
      FOREIGN KEY (participant_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      seen_at TEXT,
      FOREIGN KEY (thread_id) REFERENCES chat_threads(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      reviewer_id TEXT NOT NULL,
      reviewee_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review_text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_visible INTEGER DEFAULT 1,
      FOREIGN KEY (reviewer_id) REFERENCES users(id),
      FOREIGN KEY (reviewee_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id),
      UNIQUE(reviewer_id, reviewee_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS dismissed_events (
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      PRIMARY KEY (user_id, event_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS swipe_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('left','right')),
      swiped_at TEXT NOT NULL DEFAULT (datetime('now')),
      undone INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(event_id) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS blocks (
      blocker_id TEXT NOT NULL,
      blocked_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (blocker_id, blocked_id),
      FOREIGN KEY (blocker_id) REFERENCES users(id),
      FOREIGN KEY (blocked_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id TEXT NOT NULL,
      reported_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      detail TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (reporter_id) REFERENCES users(id),
      FOREIGN KEY (reported_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
    CREATE INDEX IF NOT EXISTS idx_events_status    ON events(status);
    CREATE INDEX IF NOT EXISTS idx_requests_event   ON join_requests(event_id);
    CREATE INDEX IF NOT EXISTS idx_messages_thread  ON messages(thread_id);
    CREATE INDEX IF NOT EXISTS idx_swipes_user      ON swipe_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_swipe_history_user ON swipe_history(user_id, swiped_at DESC);
  `);
  console.log('[DB] All tables created or verified.');
}

export default db;
