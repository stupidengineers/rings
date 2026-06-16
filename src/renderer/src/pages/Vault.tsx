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
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    const n = await window.electron?.notes.getAll();
    if (n) setNotes(n);
  }

  async function handleDelete(id: number) {
    await window.electron?.notes.delete(id);
    loadNotes();
  }

  async function handleEdit(note: Note) {
    setEditingNote(note);
  }

  async function handleSave(id: number, data: Record<string, unknown>) {
    await window.electron?.notes.update(id, data);
    setEditingNote(null);
    loadNotes();
  }

  // Distribute notes into columns (masonry-like)
  const columns: Note[][] = [[], [], [], []];
  notes.forEach((note, i) => {
    columns[i % 4].push(note);
  });

  return (
    <div className="w-full select-none h-fit flex flex-col px-4">
      <Search />
      <div className="w-full mt-4 h-fit grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="w-full h-fit flex flex-col gap-2">
            {colIdx === 0 && <New />}
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
                      images={note.images.length > 0 ? note.images : [""]}
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
