import {
  type Note,
  getNote,
  searchNotesFTS,
  getAllEmbeddings,
  getEmbeddingCount,
} from "./database";
import { embedText } from "./ollama";

export interface SearchResult {
  note: Note;
  score: number;
  source: "vector" | "fts" | "hybrid";
}

interface SearchOptions {
  limit?: number;
  type?: string;
}

// --- Helpers ---

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function bufferToFloats(buf: Buffer): number[] {
  const floats = new Float32Array(
    buf.buffer,
    buf.byteOffset,
    buf.byteLength / 4,
  );
  return Array.from(floats);
}

// --- Vector search (brute-force cosine similarity in JS) ---

async function vectorSearch(
  queryEmbedding: number[],
  limit: number,
): Promise<{ noteId: number; similarity: number }[]> {
  const rows = getAllEmbeddings();

  const scored = rows
    .map((row) => ({
      noteId: row.note_id,
      similarity: cosineSimilarity(queryEmbedding, bufferToFloats(row.embedding)),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored;
}

// --- Reciprocal Rank Fusion ---

function reciprocalRankFusion(
  ftsNoteIds: number[],
  vectorResults: { noteId: number; similarity: number }[],
): Map<number, { score: number; source: "vector" | "fts" | "hybrid" }> {
  const k = 60; // standard RRF constant
  const scores = new Map<
    number,
    { score: number; sources: Set<"vector" | "fts"> }
  >();

  // FTS rankings
  for (let i = 0; i < ftsNoteIds.length; i++) {
    const id = ftsNoteIds[i];
    const rank = i + 1;
    const existing = scores.get(id) ?? {
      score: 0,
      sources: new Set<"vector" | "fts">(),
    };
    existing.score += 1 / (k + rank);
    existing.sources.add("fts");
    scores.set(id, existing);
  }

  // Vector rankings
  for (let i = 0; i < vectorResults.length; i++) {
    const id = vectorResults[i].noteId;
    const rank = i + 1;
    const existing = scores.get(id) ?? {
      score: 0,
      sources: new Set<"vector" | "fts">(),
    };
    existing.score += 1 / (k + rank);
    existing.sources.add("vector");
    scores.set(id, existing);
  }

  // Determine source label
  const result = new Map<
    number,
    { score: number; source: "vector" | "fts" | "hybrid" }
  >();
  for (const [id, entry] of scores) {
    let source: "vector" | "fts" | "hybrid";
    if (entry.sources.size === 2) {
      source = "hybrid";
    } else if (entry.sources.has("vector")) {
      source = "vector";
    } else {
      source = "fts";
    }
    result.set(id, { score: entry.score, source });
  }

  return result;
}

// --- Public API ---

export async function hybridSearch(
  query: string,
  options?: SearchOptions,
): Promise<SearchResult[]> {
  const limit = options?.limit ?? 10;

  // Run FTS5 search
  const ftsNotes = searchNotesFTS(query);
  const ftsNoteIds = ftsNotes.map((n) => n.id);

  // Run vector search
  const queryEmbedding = await embedText(query);
  const vectorResults = await vectorSearch(queryEmbedding, 50);

  // Merge with RRF
  const merged = reciprocalRankFusion(ftsNoteIds, vectorResults);

  // Build results sorted by RRF score
  let results: SearchResult[] = [];
  const sortedEntries = [...merged.entries()].sort(
    (a, b) => b[1].score - a[1].score,
  );

  for (const [noteId, { score, source }] of sortedEntries) {
    const note = getNote(noteId);
    if (!note) continue;
    results.push({ note, score, source });
  }

  // Apply type filter
  if (options?.type) {
    results = results.filter((r) => r.note.type === options.type);
  }

  return results.slice(0, limit);
}

export async function ftsOnlySearch(
  query: string,
  options?: SearchOptions,
): Promise<SearchResult[]> {
  const limit = options?.limit ?? 10;

  let notes = searchNotesFTS(query);

  // Apply type filter
  if (options?.type) {
    notes = notes.filter((n) => n.type === options.type);
  }

  return notes.slice(0, limit).map((note, i) => ({
    note,
    score: 1 / (60 + i + 1), // consistent RRF-style scoring for comparability
    source: "fts" as const,
  }));
}

export async function search(
  query: string,
  options?: SearchOptions,
): Promise<SearchResult[]> {
  // Skip vector search entirely if no embeddings exist
  const embeddingCount = getEmbeddingCount();
  if (embeddingCount === 0) {
    return ftsOnlySearch(query, options);
  }

  try {
    return await hybridSearch(query, options);
  } catch {
    // Ollama unavailable or embedding failed — fall back to FTS-only
    return ftsOnlySearch(query, options);
  }
}
