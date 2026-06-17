import { contextBridge, ipcRenderer } from "electron";

export interface NoteData {
  type: "photo" | "album" | "quote" | "tasks";
  content?: string;
  title?: string;
  author?: string;
  images?: string[];
  tasks?: string[];
}

export interface Note {
  id: number;
  type: "photo" | "album" | "quote" | "tasks";
  content: string;
  title: string | null;
  author: string | null;
  created_at: string;
  images: string[];
  tasks: { content: string; done: boolean }[];
}

export interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: string | null;
  created_at: string;
}

contextBridge.exposeInMainWorld("electron", {
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
      ipcRenderer.on("window:maximize-change", (_, isMaximized) =>
        callback(isMaximized),
      );
    },
  },
  images: {
    save: (buffer: ArrayBuffer, ext: string): Promise<string> =>
      ipcRenderer.invoke("images:save", buffer, ext),
  },
  notes: {
    create: (data: NoteData): Promise<Note> =>
      ipcRenderer.invoke("notes:create", data),
    getAll: (): Promise<Note[]> => ipcRenderer.invoke("notes:getAll"),
    delete: (id: number): Promise<void> =>
      ipcRenderer.invoke("notes:delete", id),
    update: (id: number, data: Partial<NoteData>): Promise<Note | null> =>
      ipcRenderer.invoke("notes:update", id, data),
    toggleTask: (noteId: number, taskIndex: number): Promise<void> =>
      ipcRenderer.invoke("notes:toggleTask", noteId, taskIndex),
  },
  preferences: {
    get: (key: string): Promise<string | null> =>
      ipcRenderer.invoke("prefs:get", key),
    set: (key: string, value: string): Promise<void> =>
      ipcRenderer.invoke("prefs:set", key, value),
    getAll: (): Promise<Record<string, string>> =>
      ipcRenderer.invoke("prefs:getAll"),
  },
  chat: {
    createSession: (title?: string): Promise<ChatSession> =>
      ipcRenderer.invoke("chat:createSession", title),
    getSessions: (): Promise<ChatSession[]> =>
      ipcRenderer.invoke("chat:sessions"),
    getSession: (id: string): Promise<ChatSession | null> =>
      ipcRenderer.invoke("chat:session", id),
    deleteSession: (id: string): Promise<void> =>
      ipcRenderer.invoke("chat:deleteSession", id),
    addMessage: (
      sessionId: string,
      role: "user" | "assistant" | "system",
      content: string,
      sources?: string,
    ): Promise<ChatMessage> =>
      ipcRenderer.invoke("chat:addMessage", sessionId, role, content, sources),
    getMessages: (sessionId: string): Promise<ChatMessage[]> =>
      ipcRenderer.invoke("chat:messages", sessionId),
  },
  ollama: {
    isRunning: (): Promise<boolean> =>
      ipcRenderer.invoke("ollama:isRunning"),
    models: (): Promise<string[]> =>
      ipcRenderer.invoke("ollama:models"),
    classify: (
      text: string,
      imageCount: number,
    ): Promise<{
      type: "photo" | "album" | "quote" | "tasks";
      title?: string;
      content?: string;
      author?: string;
    }> => ipcRenderer.invoke("ollama:classify", text, imageCount),
    embed: (text: string): Promise<number[]> =>
      ipcRenderer.invoke("ollama:embed", text),
    chat: (
      messages: Array<{ role: string; content: string }>,
      model: string,
    ): Promise<string> => ipcRenderer.invoke("ollama:chat", messages, model),
    onChatChunk: (callback: (chunk: string) => void) => {
      ipcRenderer.on("ollama:chat-chunk", (_, chunk) => callback(chunk));
    },
  },
  embeddings: {
    embedAll: (): Promise<{ total: number; embedded: number; failed: number }> =>
      ipcRenderer.invoke("embeddings:embedAll"),
    status: (): Promise<{ total: number; embedded: number }> =>
      ipcRenderer.invoke("embeddings:status"),
  },
  data: {
    export: (): Promise<string | null> => ipcRenderer.invoke("data:export"),
    clear: (): Promise<void> => ipcRenderer.invoke("data:clear"),
  },
});
