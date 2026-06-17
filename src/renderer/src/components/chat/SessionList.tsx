import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon, Delete01Icon } from "@hugeicons/core-free-icons";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
}

interface SessionListProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SessionList({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: SessionListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-normal text-foreground hover:bg-foreground/5 transition-colors duration-200 cursor-pointer"
        >
          <HugeiconsIcon icon={AddCircleIcon} size={16} className="text-accent" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {sessions.map((session) => {
          const isActive = session.id === activeId;
          return (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl mb-0.5 transition-colors duration-200 cursor-pointer group flex items-start justify-between gap-1 ${
                isActive
                  ? "bg-accent/10 border-l-2 border-accent"
                  : "hover:bg-foreground/5 border-l-2 border-transparent"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-normal text-foreground truncate">
                  {session.title || "New chat"}
                </div>
                <div className="text-xs font-light text-foreground/40 mt-0.5">
                  {timeAgo(session.createdAt)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-foreground/10 transition-all duration-200 cursor-pointer text-foreground/40 hover:text-foreground/70"
              >
                <HugeiconsIcon icon={Delete01Icon} size={14} />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}
