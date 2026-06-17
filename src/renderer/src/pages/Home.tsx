import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpBigIcon, Cancel01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { classifyNote, isOllamaRunning } from "../lib/ollama";

export default function Home() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        setImages((prev) => [...prev, URL.createObjectURL(file)]);
      }
    }
  }, []);

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSend = async () => {
    if (!text.trim() && images.length === 0) return;
    setLoading(true);

    try {
      let noteType: "photo" | "album" | "quote" | "tasks" = "photo";
      let title: string | undefined;
      let author: string | undefined;
      let cleanContent = text;

      const running = await isOllamaRunning();
      if (running) {
        const result = await classifyNote(text, images.length);
        noteType = result.type;
        title = result.title;
        author = result.author;
        const PROMPT_PHRASES = ["cleaned up", "remove instructions", "main body", "null if none", "otherwise null"];
        const isGarbage = result.content &&
          PROMPT_PHRASES.some((p) => result.content!.toLowerCase().includes(p));
        if (!isGarbage) {
          let c = result.content ?? (images.length > 0 ? "" : text);
          c = c.replace(/^["'"]+|["'"]+$/g, "").trim();
          cleanContent = c;
        }
      } else {
        if (images.length > 1) noteType = "album";
        else if (images.length === 1) noteType = "photo";
        else if (text.trim().startsWith('"')) noteType = "quote";
        else if (text.includes("\n- ") || text.includes("\n* ")) noteType = "tasks";
      }

      let taskLines: string[] | undefined;
      if (noteType === "tasks") {
        let lines = cleanContent.split("\n").map((l) => l.replace(/^[-*\d.)\]]\s*/, "").trim()).filter(Boolean);
        if (lines.length === 1) {
          const bySep = lines[0].split(/,\s*(?:and\s+)?|(?:^|\s+)and\s+/).map((s) => s.trim()).filter(Boolean);
          if (bySep.length >= 2) lines = bySep;
        }
        taskLines = lines;
      }

      const savedImages: string[] = [];
      for (const blobUrl of images) {
        const res = await fetch(blobUrl);
        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        const ext = blob.type.split("/")[1] ?? "png";
        const path = await window.electron?.images.save(buffer, ext);
        if (path) savedImages.push(path);
      }

      await window.electron?.notes.create({
        type: noteType,
        content: cleanContent,
        title,
        author,
        images: savedImages.length > 0 ? savedImages : undefined,
        tasks: taskLines,
      });

      setText("");
      setImages([]);
      setSent(true);
      setTimeout(() => setSent(false), 600);
    } catch (err) {
      console.error("Failed to save note:", err);
    }

    setLoading(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-52px)] px-6 pb-24 justify-center">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl text-center mb-12 md:text-5xl font-light tracking-tight">
          Note something down
        </h1>

        <div className="relative flex flex-col border-b-2 border-b-border focus-within:border-accent transition-colors">
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 pb-4 overflow-x-auto"
              >
                {images.map((src, i) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative shrink-0 size-20 rounded-xl overflow-hidden group"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={10} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="I love sunsets"
            rows={1}
            className="w-full text-2xl font-light bg-transparent resize-none placeholder:text-foreground/30 focus:outline-none pb-3 pr-12"
          />

          <div className="absolute bottom-2 right-0 z-10">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={loading}
              className="size-9 rounded-full bg-accent text-white! flex items-center justify-center cursor-pointer shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)] hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="size-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : sent ? (
                <HugeiconsIcon icon={Tick01Icon} size={16} />
              ) : (
                <HugeiconsIcon icon={ArrowUpBigIcon} size={16} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
