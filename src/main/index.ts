import { app, BrowserWindow, ipcMain, protocol, net, dialog, nativeTheme } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { writeFile, mkdir, readFile } from "fs/promises";
import { writeFileSync, readFileSync } from "fs";
import { randomUUID } from "crypto";
import {
  initDatabase,
  createNote,
  getAllNotes,
  deleteNote,
  updateNote,
  toggleTask,
  getPreference,
  setPreference,
  getAllPreferences,
  createChatSession,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  addChatMessage,
  getChatMessages,
  saveChatSummary,
  getChatSummary,
  getEmbeddingCount,
  getNoteCount,
  clearAllData,
  searchNotes,
} from "./database";
import {
  isOllamaRunning,
  getOllamaModels,
  classifyNote,
  embedText,
  chatStream,
} from "./ollama";
import {
  queueEmbedding,
  removeEmbedding,
  embedAllNotes,
} from "./embeddings";
import { search } from "./search";
import { handleChatMessage } from "./chat";

let mainWindow: BrowserWindow | null = null;
let imagesDir: string;

function registerProtocol(): void {
  protocol.handle("rings", (request) => {
    const filePath = request.url.replace("rings://images/", "");
    return net.fetch(`file://${join(imagesDir, filePath)}`);
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    backgroundColor: "#ffffff",
    ...(process.platform === "darwin" ? { vibrancy: "under-window" as const } : {}),
    ...(process.platform === "win32" ? { backgroundMaterial: "mica" as const } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window:maximize-change", true);
  });

  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window:maximize-change", false);
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// Window controls
ipcMain.handle("window:minimize", () => mainWindow?.minimize());
ipcMain.handle("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle("window:close", () => mainWindow?.close());
ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized() ?? false);

// Image saving
ipcMain.handle("images:save", async (_, buffer: ArrayBuffer, ext: string) => {
  await mkdir(imagesDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(imagesDir, filename);
  await writeFile(filepath, Buffer.from(buffer));
  return `rings://images/${filename}`;
});

// Notes CRUD
ipcMain.handle("notes:create", async (_, data) => {
  const note = createNote(data);
  queueEmbedding(note.id);
  return note;
});
ipcMain.handle("notes:getAll", () => getAllNotes());
ipcMain.handle("notes:delete", (_, id: number) => {
  removeEmbedding(id);
  deleteNote(id);
});
ipcMain.handle("notes:update", async (_, id: number, data) => {
  const note = updateNote(id, data);
  if (note) queueEmbedding(note.id);
  return note;
});
ipcMain.handle("notes:toggleTask", (_, noteId: number, taskIndex: number) =>
  toggleTask(noteId, taskIndex),
);
// Preferences CRUD
ipcMain.handle("prefs:get", (_, key: string) => getPreference(key));
ipcMain.handle("prefs:set", (_, key: string, value: string) =>
  setPreference(key, value),
);
ipcMain.handle("prefs:getAll", () => getAllPreferences());

// Chat CRUD
ipcMain.handle("chat:createSession", (_, title?: string) =>
  createChatSession(randomUUID(), title),
);
ipcMain.handle("chat:sessions", () => getChatSessions());
ipcMain.handle("chat:session", (_, id: string) => getChatSession(id));
ipcMain.handle("chat:deleteSession", (_, id: string) => deleteChatSession(id));
ipcMain.handle(
  "chat:addMessage",
  (_, sessionId: string, role: "user" | "assistant" | "system", content: string, sources?: string) =>
    addChatMessage(sessionId, role, content, sources),
);
ipcMain.handle("chat:messages", (_, sessionId: string) =>
  getChatMessages(sessionId),
);
ipcMain.handle(
  "chat:saveSummary",
  (_, sessionId: string, content: string, coversThroughId: number) =>
    saveChatSummary(sessionId, content, coversThroughId),
);
ipcMain.handle("chat:summary", (_, sessionId: string) =>
  getChatSummary(sessionId),
);

// Ollama
ipcMain.handle("ollama:isRunning", () => isOllamaRunning());
ipcMain.handle("ollama:models", () => getOllamaModels());
ipcMain.handle(
  "ollama:classify",
  (_, text: string, imageCount: number) => classifyNote(text, imageCount),
);
ipcMain.handle("ollama:embed", (_, text: string) => embedText(text));
ipcMain.handle("chat:send", async (event, sessionId: string, message: string) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return handleChatMessage(sessionId, message, win);
});
ipcMain.handle("ollama:chat", async (event, messages, model) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const fullResponse = await chatStream(messages, model, (chunk) => {
    win?.webContents.send("ollama:chat-chunk", chunk);
  });
  return fullResponse;
});

// Search
ipcMain.handle("notes:search", async (_, query: string, options?: { limit?: number; type?: string }) => {
  if (!query.trim()) {
    return getAllNotes().slice(0, options?.limit ?? 20).map(note => ({ note, score: 1, source: "fts" as const }));
  }
  return search(query, options);
});

// Embeddings
ipcMain.handle("embeddings:embedAll", () => embedAllNotes());
ipcMain.handle("embeddings:status", () => ({
  total: getNoteCount(),
  embedded: getEmbeddingCount(),
}));

// Data export
ipcMain.handle("data:export", async () => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: "rings-vault-export.json",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (result.canceled || !result.filePath) return null;

  const notes = getAllNotes();
  const notesWithImages = notes.map((note) => ({
    ...note,
    images: note.images.map((imgPath) => {
      try {
        const filePath = imgPath.replace("rings://images/", "");
        const fullPath = join(imagesDir, filePath);
        const buffer = readFileSync(fullPath);
        return { path: imgPath, data: buffer.toString("base64") };
      } catch {
        return { path: imgPath, data: null };
      }
    }),
  }));

  writeFileSync(result.filePath, JSON.stringify(notesWithImages, null, 2));
  return result.filePath;
});

// Data clear
ipcMain.handle("data:clear", () => {
  clearAllData();
});

app.whenReady().then(() => {
  imagesDir = join(app.getPath("userData"), "images");
  registerProtocol();
  initDatabase();
  createWindow();

  nativeTheme.on("updated", () => {
    mainWindow?.webContents.send("theme:system-changed", nativeTheme.shouldUseDarkColors);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
