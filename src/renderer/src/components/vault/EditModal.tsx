import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface Note {
  id: number;
  type: "photo" | "album" | "quote" | "tasks";
  content: string;
  title: string | null;
  author: string | null;
  images: string[];
  tasks: { content: string; done: boolean }[];
}

interface Props {
  note: Note;
  onClose: () => void;
  onSave: (id: number, data: Record<string, unknown>) => void;
}

export default function EditModal({ note, onClose, onSave }: Props) {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title ?? "");
  const [author, setAuthor] = useState(note.author ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(note.id, {
      content,
      title: title || null,
      author: author || null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-4 bg-white border-2 border-border rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-normal">Edit {note.type}</h2>
              <button
                onClick={onClose}
                className="size-8 rounded-full hover:bg-stone-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            {(note.type === "album" || note.type === "tasks") && (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-xl font-light bg-transparent border-b-2 border-stone-200 focus:border-accent transition-colors pb-2 placeholder:text-stone-300"
              />
            )}

            {note.type === "quote" && (
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author"
                className="w-full text-base font-light bg-transparent border-b-2 border-stone-200 focus:border-accent transition-colors pb-2 placeholder:text-stone-300"
              />
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content..."
              rows={note.type === "quote" ? 4 : note.type === "tasks" ? 6 : 3}
              className="w-full text-lg font-light bg-transparent border-2 border-stone-200 focus:border-accent rounded-2xl p-4 resize-none placeholder:text-stone-300 transition-colors"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-3xl text-sm text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-3xl bg-accent text-white text-sm font-light hover:opacity-90 transition-opacity cursor-pointer shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
