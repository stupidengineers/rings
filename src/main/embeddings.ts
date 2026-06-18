import {
  getNote,
  saveEmbedding,
  deleteEmbedding,
  getNotesWithoutEmbeddings,
  getEmbeddingCount,
  getNoteCount,
} from "./database";
import { embedText } from "./ollama";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function embedNote(noteId: number): Promise<void> {
  const note = getNote(noteId);
  if (!note) return;

  let text = [
    note.title ?? "",
    note.content ?? "",
    ...note.tasks.map((t) => t.content),
  ]
    .join(" ")
    .trim();

  if (!text) {
    text = note.type;
  }

  const vector = await embedText(text);
  if (!vector || vector.length === 0) return;
  const buffer = Buffer.from(new Float32Array(vector).buffer);
  saveEmbedding(noteId, buffer);
}

export function removeEmbedding(noteId: number): void {
  deleteEmbedding(noteId);
}

export async function embedAllNotes(): Promise<{
  total: number;
  embedded: number;
  failed: number;
}> {
  const unembedded = getNotesWithoutEmbeddings();
  const total = getNoteCount();
  let embedded = getEmbeddingCount();
  let failed = 0;

  for (const noteId of unembedded) {
    try {
      await embedNote(noteId);
      embedded++;
    } catch (err) {
      console.error(`Failed to embed note ${noteId}:`, err);
      failed++;
    }
    await delay(100);
  }

  return { total, embedded, failed };
}

export function queueEmbedding(noteId: number): void {
  embedNote(noteId).catch((err) => {
    console.error(`Background embedding failed for note ${noteId}:`, err);
  });
}
