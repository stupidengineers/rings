import SourceCard from "./SourceCard";

interface Source {
  id: number;
  type: string;
  title: string | null;
  content: string;
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
  onSourceClick?: (id: number) => void;
}

export default function MessageBubble({
  role,
  content,
  sources,
  isStreaming,
  onSourceClick,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[70%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 text-base font-light whitespace-pre-wrap ${
            isUser
              ? "bg-accent text-white rounded-2xl rounded-br-sm"
              : "bg-foreground/5 text-foreground rounded-2xl rounded-bl-sm"
          }`}
        >
          {content}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle animate-pulse" />
          )}
        </div>

        {sources && sources.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {sources.map((source) => (
              <SourceCard
                key={source.id}
                id={source.id}
                type={source.type}
                title={source.title}
                content={source.content}
                onClick={() => onSourceClick?.(source.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
