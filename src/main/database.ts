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

export function initDatabase(): void {
  const dbPath = join(app.getPath("userData"), "rings.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

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

  return getNote(id);
}

export interface SearchResult {
  note: Note;
  score: number;
}

export function searchNotes(
  query: string,
  options?: { limit?: number; type?: string },
): SearchResult[] {
  const limit = options?.limit ?? 20;
  const type = options?.type;

  let whereClause = "1=1";
  const params: unknown[] = [];

  if (type) {
    whereClause += " AND n.type = ?";
    params.push(type);
  }

  if (query.trim()) {
    whereClause +=
      " AND (n.content LIKE ? OR n.title LIKE ? OR n.author LIKE ? OR EXISTS (SELECT 1 FROM tasks t WHERE t.note_id = n.id AND t.content LIKE ?))";
    const like = `%${query.trim()}%`;
    params.push(like, like, like, like);
  }

  params.push(limit);

  const rows = db
    .prepare(
      `SELECT n.id FROM notes n WHERE ${whereClause} ORDER BY n.created_at DESC LIMIT ?`,
    )
    .all(...params) as { id: number }[];

  return rows
    .map((r) => {
      const note = getNote(r.id);
      if (!note) return null;
      return { note, score: 1 };
    })
    .filter(Boolean) as SearchResult[];
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
