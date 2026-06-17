import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
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

  // Distribute notes into columns by ID so each note stays in the same column on delete
  // Then filter out empty columns and push them to the end so there are no gaps
  const colMap: Note[][] = [[], [], [], []];
  displayNotes.forEach((note) => {
    colMap[note.id % 4].push(note);
  });
  const filled = colMap.filter((c) => c.length > 0);
  const empty = colMap.filter((c) => c.length === 0);
  const columns = [...filled, ...empty];

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
        <div className="w-full mt-4 h-fit grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="w-full h-fit flex flex-col gap-2">
              {colIdx === 0 && !isSearching && <New />}
              <AnimatePresence mode="popLayout">
                {col.map((note) => {
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
            </div>
          ))}
        </div>
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
