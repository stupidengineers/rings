import { app, BrowserWindow, ipcMain, protocol, net } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { writeFile, mkdir } from "fs/promises";
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
} from "./database";
import {
  isOllamaRunning,
  getOllamaModels,
  classifyNote,
  embedText,
  chatStream,
} from "./ollama";

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
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
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
ipcMain.handle("notes:create", (_, data) => createNote(data));
ipcMain.handle("notes:getAll", () => getAllNotes());
ipcMain.handle("notes:delete", (_, id: number) => deleteNote(id));
ipcMain.handle("notes:update", (_, id: number, data) => updateNote(id, data));
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
ipcMain.handle("ollama:chat", async (event, messages, model) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const fullResponse = await chatStream(messages, model, (chunk) => {
    win?.webContents.send("ollama:chat-chunk", chunk);
  });
  return fullResponse;
});

app.whenReady().then(() => {
  imagesDir = join(app.getPath("userData"), "images");
  registerProtocol();
  initDatabase();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
