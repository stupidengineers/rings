import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  return (
    <div className="w-full h-[64px] focus-within:border-accent transition-all duration-200 border-b-2 border-b-border group relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Photos of orange dogs"
        className="w-full h-full text-2xl font-light placeholder:text-foreground/30"
      />
    </div>
  );
}
