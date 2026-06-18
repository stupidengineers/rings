import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpBigIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { isOllamaRunning } from "../lib/ollama";
import MessageBubble from "../components/chat/MessageBubble";
import SessionList, { type ChatSession } from "../components/chat/SessionList";

const OLLAMA_URL = "http://localhost:11434/api";

interface Source {
  id: number;
  type: string;
  title: string | null;
  content: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface SessionData {
  session: ChatSession;
  messages: ChatMessage[];
}

// Persist sessions in localStorage
function loadSessions(): SessionData[] {
  try {
    const raw = localStorage.getItem("rings-chat-sessions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(data: SessionData[]): void {
  localStorage.setItem("rings-chat-sessions", JSON.stringify(data));
}

export default function Chat() {
  const navigate = useNavigate();
  const [sessionsData, setSessionsData] = useState<SessionData[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ollamaUp, setOllamaUp] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist on change
  useEffect(() => {
    saveSessions(sessionsData);
  }, [sessionsData]);

  // Check Ollama on mount
  useEffect(() => {
    isOllamaRunning().then(setOllamaUp);
  }, []);

  const activeData = sessionsData.find((s) => s.session.id === activeSessionId);
  const messages = activeData?.messages ?? [];
  const sessions = sessionsData.map((s) => s.session);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const createSession = useCallback((): string => {
    const id = crypto.randomUUID();
    const session: ChatSession = { id, title: "", createdAt: Date.now() };
    setSessionsData((prev) => [{ session, messages: [] }, ...prev]);
    setActiveSessionId(id);
    return id;
  }, []);

  const handleNew = useCallback(() => {
    createSession();
    setInput("");
  }, [createSession]);

  const handleSelect = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setSessionsData((prev) => prev.filter((s) => s.session.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId],
  );

  const handleSourceClick = useCallback(
    (noteId: number) => {
      navigate("/vault");
    },
    [navigate],
  );

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    // Update title from first message
    setSessionsData((prev) =>
      prev.map((s) => {
        if (s.session.id !== sessionId) return s;
        const title = s.session.title || trimmed.slice(0, 50);
        return {
          session: { ...s.session, title },
          messages: [...s.messages, userMsg],
        };
      }),
    );

    setInput("");
    setIsStreaming(true);
    setStreamingText("");

    // Build conversation history for context
    const currentData = sessionsData.find((s) => s.session.id === sessionId);
    const history = currentData?.messages ?? [];
    const ollamaMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: trimmed },
    ];

    try {
      // Fetch vault notes for context
      let notes: Note[] = [];
      try {
        notes = (await window.electron?.notes.getAll()) ?? [];
      } catch {
        // No vault access
      }

      // Build system prompt with vault context
      let systemPrompt =
        "You are a helpful assistant for the RINGS app. Answer questions clearly and concisely.";
      if (notes.length > 0) {
        const vaultContext = notes
          .slice(0, 20)
          .map(
            (n) =>
              `[Note #${n.id} type=${n.type}] ${n.title ? n.title + ": " : ""}${n.content || "(no text)"}`,
          )
          .join("\n");
        systemPrompt += `\n\nThe user's vault contains these notes for reference:\n${vaultContext}\n\nWhen referencing vault items, mention their type and title. Be helpful and conversational.`;
      }

      const res = await fetch(`${OLLAMA_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: await getPreferredModel(),
          messages: [
            { role: "system", content: systemPrompt },
            ...ollamaMessages,
          ],
          stream: true,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Ollama error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Each line is a JSON object
        for (const line of chunk.split("\n").filter(Boolean)) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              fullText += parsed.message.content;
              setStreamingText(fullText);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullText,
      };

      setSessionsData((prev) =>
        prev.map((s) => {
          if (s.session.id !== sessionId) return s;
          return { ...s, messages: [...s.messages, assistantMsg] };
        }),
      );
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't get a response. Make sure Ollama is running.",
      };
      setSessionsData((prev) =>
        prev.map((s) => {
          if (s.session.id !== sessionId) return s;
          return { ...s, messages: [...s.messages, errorMsg] };
        }),
      );
      setOllamaUp(false);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }, [input, isStreaming, activeSessionId, createSession, sessionsData]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="flex min-h-[calc(100vh-52px)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-[240px] shrink-0 border-r border-border bg-foreground/[0.02] flex flex-col">
          <SessionList
            sessions={sessions}
            activeId={activeSessionId}
            onSelect={handleSelect}
            onNew={handleNew}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toggle sidebar */}
        <div className="px-4 py-2 flex items-center">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-foreground/40 hover:text-foreground/70 transition-colors duration-200 cursor-pointer text-sm"
          >
            {sidebarOpen ? (
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
            )}
          </button>
        </div>

        {/* Ollama warning */}
        {ollamaUp === false && (
          <div className="mx-4 mb-2 px-4 py-3 rounded-xl bg-foreground/5 border border-border">
            <div className="text-sm font-normal text-foreground">Ollama is not running</div>
            <div className="text-xs font-light text-foreground/50 mt-0.5">
              Start Ollama to chat with your vault. The input is disabled until a connection is available.
            </div>
          </div>
        )}

        {!hasMessages && !activeSessionId ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h2 className="text-3xl font-light text-foreground mb-2">Chat with your vault</h2>
            <p className="text-foreground/50 font-light mb-8">
              Ask questions about your notes, photos, quotes, and lists
            </p>
            <div className="w-full max-w-xl">
              <div className="relative flex flex-col border-b-2 border-b-stone-200 focus-within:border-accent transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask something..."
                  rows={1}
                  disabled={ollamaUp === false}
                  className="w-full text-2xl font-light bg-transparent resize-none placeholder:text-stone-300 focus:outline-none pb-3 pr-12 disabled:opacity-50"
                />
                <div className="absolute bottom-2 right-0">
                  <button
                    onClick={handleSend}
                    disabled={isStreaming || !input.trim() || ollamaUp === false}
                    className="size-9 rounded-full bg-accent text-white flex items-center justify-center cursor-pointer shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)] hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <HugeiconsIcon icon={ArrowUpBigIcon} size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Conversation view */
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="max-w-2xl mx-auto">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    sources={msg.sources}
                    onSourceClick={handleSourceClick}
                  />
                ))}
                {isStreaming && streamingText && (
                  <MessageBubble
                    role="assistant"
                    content={streamingText}
                    isStreaming
                  />
                )}
                {isStreaming && !streamingText && (
                  <div className="flex justify-start mb-3">
                    <div className="px-4 py-3 bg-foreground/5 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <span className="size-1.5 rounded-full bg-foreground/30 animate-pulse" />
                        <span className="size-1.5 rounded-full bg-foreground/30 animate-pulse [animation-delay:150ms]" />
                        <span className="size-1.5 rounded-full bg-foreground/30 animate-pulse [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom input */}
            <div className="border-t border-border px-6 py-4">
              <div className="max-w-2xl mx-auto">
                <div className="relative flex flex-col border-b-2 border-b-stone-200 focus-within:border-accent transition-colors">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    disabled={ollamaUp === false}
                    className="w-full text-lg font-light bg-transparent resize-none placeholder:text-stone-300 focus:outline-none pb-3 pr-12 disabled:opacity-50"
                  />
                  <div className="absolute bottom-2 right-0">
                    <button
                      onClick={handleSend}
                      disabled={isStreaming || !input.trim() || ollamaUp === false}
                      className="size-9 rounded-full bg-accent text-white flex items-center justify-center cursor-pointer shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)] hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {isStreaming ? (
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <HugeiconsIcon icon={ArrowUpBigIcon} size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Reuse the model-picking logic from ollama.ts
const PREFERRED = ["llama3.2:3b", "qwen2.5:3b", "phi4-mini:3.8b", "gemma3:4b"];

async function getPreferredModel(): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/tags`);
  const data = await res.json();
  const names: string[] = data.models?.map((m: { name: string }) => m.name) ?? [];
  if (names.length === 0) throw new Error("No Ollama models found.");
  const preferred = PREFERRED.find((p) => names.some((n) => n.startsWith(p)));
  return preferred ?? names[0];
}

