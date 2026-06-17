import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";

interface SourceCardProps {
  id: number;
  type: string;
  title: string | null;
  content: string;
  onClick: () => void;
}

export default function SourceCard({ type, title, content, onClick }: SourceCardProps) {
  const snippet = content.length > 50 ? content.slice(0, 50) + "..." : content;

  return (
    <button
      onClick={onClick}
      className="border border-border rounded-xl p-3 text-left hover:bg-foreground/5 cursor-pointer transition-colors duration-200 max-w-[200px]"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <HugeiconsIcon icon={PencilEdit01Icon} size={12} className="text-accent" />
        <span className="text-xs font-normal text-foreground/50 uppercase tracking-wide">
          {type}
        </span>
      </div>
      {title && (
        <div className="text-sm font-normal text-foreground truncate">{title}</div>
      )}
      <div className="text-xs font-light text-foreground/60 mt-0.5">{snippet}</div>
    </button>
  );
}
