import { useState, useCallback, useEffect, useRef } from "react";

interface SearchProps {
  onSearch: (query: string, type: string | null) => void;
}

const TYPES = [
  { label: "All", value: null },
  { label: "Photos", value: "photo" },
  { label: "Quotes", value: "quote" },
  { label: "Lists", value: "tasks" },
  { label: "Albums", value: "album" },
];

export default function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const triggerSearch = useCallback(
    (q: string, type: string | null) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(q, type);
      }, 300);
    },
    [onSearch],
  );

  useEffect(() => {
    triggerSearch(query, activeType);
  }, [query, activeType, triggerSearch]);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full h-[64px] focus-within:border-accent transition-all duration-150 border-b-2 border-b-border group relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your vault..."
          className="w-full h-full text-2xl font-light bg-transparent text-foreground placeholder:text-foreground/30"
        />
      </div>
      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveType(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
              activeType === t.value
                ? "bg-accent text-white"
                : "border border-border text-foreground/60 hover:bg-surface-hover"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
