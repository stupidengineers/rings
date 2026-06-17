interface NoteData {
  type: "photo" | "album" | "quote" | "tasks";
  content?: string;
  title?: string;
  author?: string;
  images?: string[];
  tasks?: string[];
}

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

interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: number;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: string | null;
  created_at: string;
}

interface ElectronAPI {
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => void;
  };
  images: {
    save: (buffer: ArrayBuffer, ext: string) => Promise<string>;
  };
  notes: {
    create: (data: NoteData) => Promise<Note>;
    getAll: () => Promise<Note[]>;
    delete: (id: number) => Promise<void>;
    update: (id: number, data: Partial<NoteData>) => Promise<Note | null>;
    toggleTask: (noteId: number, taskIndex: number) => Promise<void>;
  };
  preferences: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    getAll: () => Promise<Record<string, string>>;
  };
  chat: {
    createSession: (title?: string) => Promise<ChatSession>;
    getSessions: () => Promise<ChatSession[]>;
    getSession: (id: string) => Promise<ChatSession | null>;
    deleteSession: (id: string) => Promise<void>;
    addMessage: (
      sessionId: string,
      role: "user" | "assistant" | "system",
      content: string,
      sources?: string,
    ) => Promise<ChatMessage>;
    getMessages: (sessionId: string) => Promise<ChatMessage[]>;
  };
  ollama: {
    isRunning: () => Promise<boolean>;
    models: () => Promise<string[]>;
    classify: (
      text: string,
      imageCount: number,
    ) => Promise<{
      type: "photo" | "album" | "quote" | "tasks";
      title?: string;
      content?: string;
      author?: string;
    }>;
    embed: (text: string) => Promise<number[]>;
    chat: (
      messages: Array<{ role: string; content: string }>,
      model: string,
    ) => Promise<string>;
    onChatChunk: (callback: (chunk: string) => void) => void;
  };
  embeddings: {
    embedAll: () => Promise<{ total: number; embedded: number; failed: number }>;
    status: () => Promise<{ total: number; embedded: number }>
  };
}

interface Window {
  electron?: ElectronAPI;
}
