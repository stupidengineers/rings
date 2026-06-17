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
    search: (
      query: string,
      options?: { limit?: number; type?: string },
    ): Promise<{ note: Note; score: number; source: "vector" | "fts" | "hybrid" }[]> =>
      ipcRenderer.invoke("notes:search", query, options),
  },
});
