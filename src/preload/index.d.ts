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
  ollama: {
    models: () => Promise<string[]>;
    isRunning: () => Promise<boolean>;
  };
  data: {
    export: () => Promise<string | null>;
    clear: () => Promise<void>;
  };
}

interface Window {
  electron?: ElectronAPI;
}
