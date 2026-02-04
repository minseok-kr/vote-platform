import Database from "better-sqlite3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Database path - use data directory for persistence
const dbPath =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "data", "vote.db")
    : path.join(process.cwd(), "vote.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists in production
    if (process.env.NODE_ENV === "production") {
      const fs = require("fs");
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  // Create tables
  db.exec(`
    -- Polls table
    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      question TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'other',
      status TEXT DEFAULT 'active',
      is_featured INTEGER DEFAULT 0,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Poll options table
    CREATE TABLE IF NOT EXISTS poll_options (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      poll_id TEXT NOT NULL,
      text TEXT NOT NULL,
      votes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    );

    -- Votes table
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      poll_id TEXT NOT NULL,
      option_id TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
      FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
      UNIQUE(poll_id, visitor_id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);
    CREATE INDEX IF NOT EXISTS idx_polls_category ON polls(category);
    CREATE INDEX IF NOT EXISTS idx_polls_featured ON polls(is_featured);
    CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
    CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
    CREATE INDEX IF NOT EXISTS idx_votes_visitor_id ON votes(visitor_id);
  `);

  // Seed with sample data if empty
  const pollCount = db.prepare("SELECT COUNT(*) as count FROM polls").get() as {
    count: number;
  };

  if (pollCount.count === 0) {
    seedDatabase(db);
  }
}

function seedDatabase(db: Database.Database) {
  const now = new Date().toISOString();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const nextMonth = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Sample polls
  const polls = [
    {
      id: uuidv4(),
      question: "2025년 최고의 프로그래밍 언어는?",
      description: "올해 가장 인기 있는 프로그래밍 언어를 선택해주세요.",
      category: "tech",
      is_featured: 1,
      expires_at: nextMonth,
      options: [
        { text: "Python", votes: 156 },
        { text: "JavaScript", votes: 132 },
        { text: "TypeScript", votes: 98 },
        { text: "Rust", votes: 67 },
        { text: "Go", votes: 45 },
      ],
    },
    {
      id: uuidv4(),
      question: "가장 기대되는 2025년 영화는?",
      description: "올해 개봉 예정인 영화 중 가장 기대되는 작품을 선택해주세요.",
      category: "entertainment",
      is_featured: 0,
      expires_at: nextWeek,
      options: [
        { text: "아바타 3", votes: 89 },
        { text: "미션 임파서블 8", votes: 76 },
        { text: "주라기 월드 4", votes: 54 },
        { text: "매트릭스 5", votes: 43 },
      ],
    },
    {
      id: uuidv4(),
      question: "최고의 커피 브랜드는?",
      description: "당신이 가장 좋아하는 커피 브랜드를 선택해주세요.",
      category: "lifestyle",
      is_featured: 0,
      expires_at: nextWeek,
      options: [
        { text: "스타벅스", votes: 234 },
        { text: "블루보틀", votes: 187 },
        { text: "폴바셋", votes: 123 },
        { text: "투썸플레이스", votes: 98 },
        { text: "이디야", votes: 76 },
      ],
    },
    {
      id: uuidv4(),
      question: "선호하는 원격 근무 형태는?",
      description: "가장 이상적인 근무 형태를 선택해주세요.",
      category: "business",
      is_featured: 0,
      expires_at: nextMonth,
      options: [
        { text: "완전 원격", votes: 145 },
        { text: "하이브리드 (주 2-3일 출근)", votes: 198 },
        { text: "완전 출근", votes: 34 },
        { text: "자율 선택", votes: 167 },
      ],
    },
    {
      id: uuidv4(),
      question: "2025 프리미어리그 우승팀 예측",
      description: "이번 시즌 프리미어리그 우승팀을 예측해주세요.",
      category: "sports",
      is_featured: 0,
      expires_at: nextMonth,
      options: [
        { text: "맨체스터 시티", votes: 234 },
        { text: "아스날", votes: 198 },
        { text: "리버풀", votes: 176 },
        { text: "첼시", votes: 87 },
        { text: "맨체스터 유나이티드", votes: 65 },
      ],
    },
  ];

  const insertPoll = db.prepare(`
    INSERT INTO polls (id, question, description, category, is_featured, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOption = db.prepare(`
    INSERT INTO poll_options (id, poll_id, text, votes, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    for (const poll of polls) {
      insertPoll.run(
        poll.id,
        poll.question,
        poll.description,
        poll.category,
        poll.is_featured,
        poll.expires_at,
        now,
        now
      );

      for (const option of poll.options) {
        insertOption.run(uuidv4(), poll.id, option.text, option.votes, now);
      }
    }
  });

  transaction();
}

// Types
export interface Poll {
  id: string;
  question: string;
  description: string | null;
  category: string;
  status: string;
  is_featured: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  votes: number;
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  visitor_id: string;
  created_at: string;
}

export interface PollWithOptions extends Poll {
  options: (PollOption & { percentage: number })[];
  total_votes: number;
}
