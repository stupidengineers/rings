import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useThemeContext, type Theme } from "../lib/theme";

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div>
        <div className="text-lg font-normal">{label}</div>
        {description && (
          <div className="text-sm text-foreground/50 mt-0.5">{description}</div>
        )}
      </div>
      <div className="shrink-0 ml-8">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
        on ? "bg-accent" : "bg-border"
      }`}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 size-5 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useThemeContext();
  const options: { label: string; value: Theme }[] = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ];

  return (
    <div className="flex gap-1 bg-border/50 rounded-full p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`px-4 py-1 text-sm rounded-full transition-colors cursor-pointer ${
            theme === opt.value
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground/50 hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [models, setModels] = useState<string[]>([]);
  const [ollamaRunning, setOllamaRunning] = useState(false);
  const [classifyModel, setClassifyModel] = useState("");
  const [chatModel, setChatModel] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadModels();
    loadPreferences();
  }, []);

  async function loadModels() {
    const running = await window.electron?.ollama.isRunning();
    setOllamaRunning(running ?? false);
    if (running) {
      const m = await window.electron?.ollama.models();
      setModels(m ?? []);
    }
  }

  async function loadPreferences() {
    const cm = await window.electron?.preferences.get("model_classify");
    const ch = await window.electron?.preferences.get("model_chat");
    if (cm) setClassifyModel(cm);
    if (ch) setChatModel(ch);
  }

  async function handleModelChange(role: "model_classify" | "model_chat", value: string) {
    await window.electron?.preferences.set(role, value);
    if (role === "model_classify") setClassifyModel(value);
    else setChatModel(value);
  }

  async function handleExport() {
    setExporting(true);
    await window.electron?.data.export();
    setExporting(false);
  }

  async function handleClear() {
    if (!window.confirm("This will permanently delete all notes, images, and preferences. This cannot be undone. Are you sure?")) return;
    await window.electron?.data.clear();
    window.location.reload();
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-light tracking-tight mb-10">Settings</h1>

      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          Appearance
        </h2>
        <SettingRow label="Theme" description="Choose light, dark, or follow system">
          <ThemeSelector />
        </SettingRow>
      </div>

      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          Models
        </h2>
        {ollamaRunning ? (
          <>
            <SettingRow label="Classification" description="Fast model for note type detection">
              <select
                value={classifyModel}
                onChange={(e) => handleModelChange("model_classify", e.target.value)}
                className="bg-surface border-2 border-border rounded-xl px-3 py-1.5 text-sm text-foreground cursor-pointer"
              >
                <option value="">Auto-detect</option>
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </SettingRow>
            <SettingRow label="Chat" description="Larger model for conversations">
              <select
                value={chatModel}
                onChange={(e) => handleModelChange("model_chat", e.target.value)}
                className="bg-surface border-2 border-border rounded-xl px-3 py-1.5 text-sm text-foreground cursor-pointer"
              >
                <option value="">Default</option>
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </SettingRow>
          </>
        ) : (
          <div className="py-4 text-foreground/50 text-sm">
            Ollama is not running. Start it to configure models.
          </div>
        )}
      </div>

      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          General
        </h2>
        <SettingRow label="Notifications" description="Receive reminders and updates">
          <Toggle on={notifications} onChange={() => setNotifications(!notifications)} />
        </SettingRow>
        <SettingRow label="Auto-save" description="Automatically save changes">
          <Toggle on={autoSave} onChange={() => setAutoSave(!autoSave)} />
        </SettingRow>
      </div>

      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          Data
        </h2>
        <SettingRow label="Export vault" description="Download all your data as JSON">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2 text-sm rounded-3xl border-2 border-border hover:bg-foreground/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export"}
          </button>
        </SettingRow>
        <SettingRow label="Clear all data" description="Permanently delete everything">
          <button
            onClick={handleClear}
            className="px-5 py-2 text-sm rounded-3xl border-2 border-red-300 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </SettingRow>
      </div>

      <div className="rounded-3xl border-2 border-border p-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          About
        </h2>
        <SettingRow label="Version">
          <span className="text-foreground/50 text-sm">0.1.0</span>
        </SettingRow>
        <SettingRow label="Made with">
          <span className="text-foreground/50 text-sm">
            Electron, React, Tailwind CSS, Ollama
          </span>
        </SettingRow>
      </div>
    </div>
  );
}
