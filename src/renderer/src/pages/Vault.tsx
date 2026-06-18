import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import List from "../components/vault/List";
import New from "../components/vault/New";
import Photo from "../components/vault/Photo";
import PhotoAlbum from "../components/vault/PhotoAlbum";
import Quote from "../components/vault/Quote";
import Search from "../components/vault/Search";
import EditModal from "../components/vault/EditModal";

interface Note {
  id: number;
  type: "photo" | "album" | "quote" | "tasks";
  content: string;
  title: string | null;
  author: string | null;
  created_at: string;
  images: string[];
  tasks: { content: string; done: boolean }[];
}

export default function Vault() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    const n = await window.electron?.notes.getAll();
    if (n) setNotes(n);
  }

  async function handleSearch(query: string, type: string | null) {
    if (!query.trim() && !type) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = await window.electron?.notes.search(query, {
      limit: 20,
      type: type || undefined,
    });

    if (results) {
      setSearchResults(results.map((r: { note: Note }) => r.note));
    }
  }

  async function handleDelete(id: number) {
    await window.electron?.notes.delete(id);
    loadNotes();
    if (searchResults) {
      setSearchResults(searchResults.filter((n) => n.id !== id));
    }
  }

  async function handleEdit(note: Note) {
    setEditingNote(note);
  }

  async function handleSave(id: number, data: Record<string, unknown>) {
    await window.electron?.notes.update(id, data);
    setEditingNote(null);
    loadNotes();
  }

  const displayNotes = searchResults ?? notes;

  // Stable column assignments: each note gets a column once and keeps it.
  // Delete only causes vertical shift within that column.
  // When a column empties, remaining columns collapse left.
  const NUM_COLS = 5;
  const colMapRef = useRef<Map<number, number>>(new Map());

  const colMap = colMapRef.current;
  const activeIds = new Set(displayNotes.map((n) => n.id));

  // Clean up assignments for notes that no longer exist
  for (const id of colMap.keys()) {
    if (!activeIds.has(id)) colMap.delete(id);
  }

  // Assign new notes to the shortest column (left-to-right tiebreak)
  const colCounts = Array.from({ length: NUM_COLS }, () => 0);
  for (const col of colMap.values()) colCounts[col]++;

  for (const note of displayNotes) {
    if (!colMap.has(note.id)) {
      let minIdx = 0;
      for (let i = 1; i < NUM_COLS; i++) {
        if (colCounts[i] < colCounts[minIdx]) minIdx = i;
      }
      colMap.set(note.id, minIdx);
      colCounts[minIdx]++;
    }
  }

  // Build columns from stable assignments, keeping original index as stable key
  const rawColumns: { id: number; notes: Note[] }[] = Array.from(
    { length: NUM_COLS },
    (_, i) => ({ id: i, notes: [] }),
  );
  for (const note of displayNotes) {
    rawColumns[colMap.get(note.id)!].notes.push(note);
  }

  // Only render non-empty columns — they slide into place via layout animation
  const columns = rawColumns.filter((c) => c.notes.length > 0);

  return (
    <div className="w-full select-none h-fit flex flex-col px-4">
      <Search onSearch={handleSearch} />
      {isSearching && (
        <p className="text-sm text-foreground/40 mt-1">
          {displayNotes.length} {displayNotes.length === 1 ? "result" : "results"}
        </p>
      )}
      {isSearching && displayNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-foreground/40 italic text-lg">No notes found</p>
          <p className="text-foreground/30 text-sm mt-1">
            Try a different search or filter
          </p>
        </div>
      ) : (
        <LayoutGroup>
        <motion.div layout className="w-full mt-4 h-fit grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2">
          {columns.map((col, colIdx) => (
            <motion.div
              key={`col-${col.id}`}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full h-fit flex flex-col gap-2"
            >
              {colIdx === 0 && !isSearching && <New />}
              <AnimatePresence mode="popLayout">
                {col.notes.map((note) => {
                  switch (note.type) {
                    case "photo":
                      return (
                        <Photo
                          key={note.id}
                          layoutId={`card-${note.id}`}
                          imageUrl={note.images[0] ?? ""}
                          caption={note.content}
                          onDelete={() => handleDelete(note.id)}
                          onEdit={() => handleEdit(note)}
                        />
                      );
                    case "album":
                      return (
                        <PhotoAlbum
                          key={note.id}
                          layoutId={`card-${note.id}`}
                          title={note.title ?? "Album"}
                          images={
                            note.images.length > 0 ? note.images : [""]
                          }
                          onDelete={() => handleDelete(note.id)}
                          onEdit={() => handleEdit(note)}
                        />
                      );
                    case "quote":
                      return (
                        <Quote
                          key={note.id}
                          layoutId={`card-${note.id}`}
                          text={note.content}
                          author={note.author ?? undefined}
                          onDelete={() => handleDelete(note.id)}
                          onEdit={() => handleEdit(note)}
                        />
                      );
                    case "tasks":
                      return (
                        <List
                          key={note.id}
                          layoutId={`card-${note.id}`}
                          title={note.title ?? "Tasks"}
                          initialItems={note.tasks.map((t) => ({
                            title: t.content,
                            done: t.done,
                          }))}
                          onDelete={() => handleDelete(note.id)}
                          onEdit={() => handleEdit(note)}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
        </LayoutGroup>
      )}
      {editingNote && (
        <EditModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
