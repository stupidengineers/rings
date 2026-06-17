import Database from "better-sqlite3";
import { app } from "electron";
import { join } from "path";

let db: Database.Database;

export interface Note {
  id: number;
  type: "photo" | "album" | "quote" | "tasks";
  content: string;
  title: string | null;
  author: string | null;
  created_at: string;
  images: string[];
  tasks: { content: string; done: boolean }[];
}

export interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: string | null;
  created_at: string;
}

export interface ChatSummary {
  id: number;
  session_id: string;
  content: string;
  covers_through_message_id: number | null;
  created_at: string;
}

export function initDatabase(): void {
  const dbPath = join(app.getPath("userData"), "rings.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('photo','album','quote','tasks')),
      content TEXT DEFAULT '',
      title TEXT,
      author TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      path TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );

<<<<<<< HEAD
    CREATE VIRTUAL TABLE IF NOT EXISTS note_fts USING fts5(note_id, content);

    CREATE TABLE IF NOT EXISTS note_embeddings (
      note_id INTEGER PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
      embedding BLOB
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      sources TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      covers_through_message_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT
=======
    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
>>>>>>> worktree-agent-a06dce57e83d3c65e
    );
  `);
}

export function createNote(data: {
  type: Note["type"];
  content?: string;
  title?: string;
  author?: string;
  images?: string[];
  tasks?: string[];
}): Note {
  const stmt = db.prepare(
    "INSERT INTO notes (type, content, title, author) VALUES (?, ?, ?, ?)",
  );
  const result = stmt.run(
    data.type,
    data.content ?? "",
    data.title ?? null,
    data.author ?? null,
  );

  const noteId = result.lastInsertRowid as number;

  if (data.images?.length) {
    const imgStmt = db.prepare(
      "INSERT INTO images (note_id, path, sort_order) VALUES (?, ?, ?)",
    );
    for (let i = 0; i < data.images.length; i++) {
      imgStmt.run(noteId, data.images[i], i);
    }
  }

  if (data.tasks?.length) {
    const taskStmt = db.prepare(
      "INSERT INTO tasks (note_id, content, sort_order) VALUES (?, ?, ?)",
    );
    for (let i = 0; i < data.tasks.length; i++) {
      taskStmt.run(noteId, data.tasks[i], i);
    }
  }

  // Index in FTS: concatenate title + content + task text
  const ftsContent = [
    data.title ?? "",
    data.content ?? "",
    ...(data.tasks ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  db.prepare("INSERT INTO note_fts (note_id, content) VALUES (?, ?)").run(
    noteId,
    ftsContent,
  );

  return getNote(noteId)!;
}

export function getNote(id: number): Note | null {
  const note = db
    .prepare("SELECT * FROM notes WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  if (!note) return null;

  const images = db
    .prepare("SELECT path FROM images WHERE note_id = ? ORDER BY sort_order")
    .all(id)
    .map((r: unknown) => (r as { path: string }).path);

  const tasks = db
    .prepare(
      "SELECT content, done FROM tasks WHERE note_id = ? ORDER BY sort_order",
    )
    .all(id)
    .map((r: unknown) => {
      const t = r as { content: string; done: number };
      return { content: t.content, done: !!t.done };
    });

  return {
    id: note.id as number,
    type: note.type as Note["type"],
    content: note.content as string,
    title: note.title as string | null,
    author: note.author as string | null,
    created_at: note.created_at as string,
    images,
    tasks,
  };
}

export function getAllNotes(): Note[] {
  const notes = db
    .prepare("SELECT id FROM notes ORDER BY created_at DESC")
    .all() as { id: number }[];

  return notes.map((n) => getNote(n.id)!).filter(Boolean);
}

export function deleteNote(id: number): void {
  db.prepare("DELETE FROM note_fts WHERE note_id = ?").run(id);
  db.prepare("DELETE FROM notes WHERE id = ?").run(id);
}

export function updateNote(
  id: number,
  data: {
    type?: Note["type"];
    content?: string;
    title?: string | null;
    author?: string | null;
    images?: string[];
    tasks?: string[];
  },
): Note | null {
  const existing = getNote(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.type !== undefined) {
    updates.push("type = ?");
    values.push(data.type);
  }
  if (data.content !== undefined) {
    updates.push("content = ?");
    values.push(data.content);
  }
  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  if (data.author !== undefined) {
    updates.push("author = ?");
    values.push(data.author);
  }

  if (updates.length > 0) {
    db.prepare(`UPDATE notes SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values,
      id,
    );
  }

  if (data.images !== undefined) {
    db.prepare("DELETE FROM images WHERE note_id = ?").run(id);
    const imgStmt = db.prepare(
      "INSERT INTO images (note_id, path, sort_order) VALUES (?, ?, ?)",
    );
    data.images.forEach((path, i) => imgStmt.run(id, path, i));
  }

  if (data.tasks !== undefined) {
    db.prepare("DELETE FROM tasks WHERE note_id = ?").run(id);
    const taskStmt = db.prepare(
      "INSERT INTO tasks (note_id, content, done, sort_order) VALUES (?, ?, 0, ?)",
    );
    data.tasks.forEach((content, i) => taskStmt.run(id, content, i));
  }

  // Rebuild FTS entry with current note state
  const updated = getNote(id);
  if (updated) {
    const ftsContent = [
      updated.title ?? "",
      updated.content,
      ...updated.tasks.map((t) => t.content),
    ]
      .filter(Boolean)
      .join(" ");
    db.prepare("DELETE FROM note_fts WHERE note_id = ?").run(id);
    db.prepare("INSERT INTO note_fts (note_id, content) VALUES (?, ?)").run(
      id,
      ftsContent,
    );
  }

  return updated;
}

export function toggleTask(noteId: number, taskIndex: number): void {
  const task = db
    .prepare(
      "SELECT id, done FROM tasks WHERE note_id = ? ORDER BY sort_order LIMIT 1 OFFSET ?",
    )
    .get(noteId, taskIndex) as { id: number; done: number } | undefined;

  if (task) {
    db.prepare("UPDATE tasks SET done = ? WHERE id = ?").run(
      task.done ? 0 : 1,
      task.id,
    );
  }
}

<<<<<<< HEAD
// --- FTS search ---

export function searchNotesFTS(query: string): Note[] {
  const rows = db
    .prepare("SELECT note_id FROM note_fts WHERE note_fts MATCH ? ORDER BY rank")
    .all(query) as { note_id: string }[];

  return rows
    .map((r) => getNote(Number(r.note_id)))
    .filter((n): n is Note => n !== null);
}

// --- Preferences ---

=======
>>>>>>> worktree-agent-a06dce57e83d3c65e
export function getPreference(key: string): string | null {
  const row = db
    .prepare("SELECT value FROM preferences WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setPreference(key: string, value: string): void {
  db.prepare(
    "INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, value);
}

export function getAllPreferences(): Record<string, string> {
<<<<<<< HEAD
  const rows = db.prepare("SELECT key, value FROM preferences").all() as {
    key: string;
    value: string;
  }[];
=======
  const rows = db
    .prepare("SELECT key, value FROM preferences")
    .all() as { key: string; value: string }[];
>>>>>>> worktree-agent-a06dce57e83d3c65e
  const prefs: Record<string, string> = {};
  for (const row of rows) {
    prefs[row.key] = row.value;
  }
  return prefs;
}

<<<<<<< HEAD
// --- Chat sessions ---

export function createChatSession(id: string, title?: string): ChatSession {
  db.prepare("INSERT INTO chat_sessions (id, title) VALUES (?, ?)").run(
    id,
    title ?? null,
  );
  return getChatSession(id)!;
}

export function getChatSessions(): ChatSession[] {
  return db
    .prepare("SELECT * FROM chat_sessions ORDER BY updated_at DESC")
    .all() as ChatSession[];
}

export function getChatSession(id: string): ChatSession | null {
  const row = db
    .prepare("SELECT * FROM chat_sessions WHERE id = ?")
    .get(id) as ChatSession | undefined;
  return row ?? null;
}

export function deleteChatSession(id: string): void {
  db.prepare("DELETE FROM chat_sessions WHERE id = ?").run(id);
}

// --- Chat messages ---

export function addChatMessage(
  sessionId: string,
  role: ChatMessage["role"],
  content: string,
  sources?: string,
): ChatMessage {
  const result = db
    .prepare(
      "INSERT INTO chat_messages (session_id, role, content, sources) VALUES (?, ?, ?, ?)",
    )
    .run(sessionId, role, content, sources ?? null);

  db.prepare("UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?").run(
    sessionId,
  );

  return db
    .prepare("SELECT * FROM chat_messages WHERE id = ?")
    .get(result.lastInsertRowid) as ChatMessage;
}

export function getChatMessages(sessionId: string): ChatMessage[] {
  return db
    .prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC")
    .all(sessionId) as ChatMessage[];
}

// --- Chat summaries ---

export function saveChatSummary(
  sessionId: string,
  content: string,
  coversThroughId: number,
): ChatSummary {
  const result = db
    .prepare(
      "INSERT INTO chat_summaries (session_id, content, covers_through_message_id) VALUES (?, ?, ?)",
    )
    .run(sessionId, content, coversThroughId);

  return db
    .prepare("SELECT * FROM chat_summaries WHERE id = ?")
    .get(result.lastInsertRowid) as ChatSummary;
}

export function getChatSummary(sessionId: string): ChatSummary | null {
  const row = db
    .prepare(
      "SELECT * FROM chat_summaries WHERE session_id = ? ORDER BY created_at DESC LIMIT 1",
    )
    .get(sessionId) as ChatSummary | undefined;
  return row ?? null;
}

// --- Embedding helpers ---

export function saveEmbedding(noteId: number, embedding: Buffer): void {
  db.prepare(
    "INSERT OR REPLACE INTO note_embeddings (note_id, embedding) VALUES (?, ?)",
  ).run(noteId, embedding);
}

export function getEmbedding(noteId: number): Buffer | null {
  const row = db
    .prepare("SELECT embedding FROM note_embeddings WHERE note_id = ?")
    .get(noteId) as { embedding: Buffer } | undefined;
  return row?.embedding ?? null;
}

export function deleteEmbedding(noteId: number): void {
  db.prepare("DELETE FROM note_embeddings WHERE note_id = ?").run(noteId);
}

export function getNotesWithoutEmbeddings(): number[] {
  const rows = db
    .prepare(
      "SELECT n.id FROM notes n LEFT JOIN note_embeddings e ON n.id = e.note_id WHERE e.note_id IS NULL",
    )
    .all() as { id: number }[];
  return rows.map((r) => r.id);
}

export function getEmbeddingCount(): number {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM note_embeddings")
    .get() as { count: number };
  return row.count;
}

export function getNoteCount(): number {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM notes")
    .get() as { count: number };
  return row.count;
=======
export function clearAllData(): void {
  db.exec("DELETE FROM tasks");
  db.exec("DELETE FROM images");
  db.exec("DELETE FROM notes");
  db.exec("DELETE FROM preferences");
>>>>>>> worktree-agent-a06dce57e83d3c65e
}
