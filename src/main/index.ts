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
} from "./database";

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
